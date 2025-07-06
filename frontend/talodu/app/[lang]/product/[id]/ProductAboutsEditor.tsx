// product/id/ProductAboutsEditor.tsx
import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import axios from 'axios';

interface ProductAbout {
  id: number;
  about_text: string;
  item_order: number;
}

const ProductAboutsEditor = ({ productId, initialDetails }: { productId: number; initialDetails: ProductAbout[] }) => {
  const [abouts, setDetails] = useState<ProductAbout[]>(initialDetails);
  const [newDetail, setNewDetail] = useState('');
  const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '/api';
  const token = localStorage.getItem('j_auth_token');

 

  const handleAddDetail = async () => {
  if (!newDetail.trim()) return;
  
  try {
    const response = await axios.post(
      `${API_URL}/products/abouts/${productId}`,
      { 
        about_text: newDetail,
        item_order: abouts.length > 0 
          ? Math.max(...abouts.map(d => d.item_order)) + 1 
          : 1
      },
      {
        headers: { 
          'Content-Type': 'application/json', 
          Authorization: `${token}` 
        }
      }
    );

    const addedDetail = response.data;
    console.log("The response: ", addedDetail)
    setDetails([...abouts, addedDetail]);
    setNewDetail('');
  } catch (error) {
    console.error('Failed to add detail:', error);
  }
};

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    
    const items = Array.from(abouts);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    // Update order values
    const updatedDetails = items.map((item, index) => ({
      ...item,
      item_order: index + 1
    }));
    
    setDetails(updatedDetails);
    saveNewOrder(updatedDetails);
  };

const saveNewOrder = async (updatedDetails: ProductAbout[]) => {
  try {

    // Map to the format expected by backend
    const orderUpdates = updatedDetails.map((item, index) => ({
      id: item.id,
      item_order: index + 1
    }));
    const response = await axios.put(
      `${API_URL}/products/abouts/order/${productId}`,
      orderUpdates,
      {
        headers: { 
          'Content-Type': 'application/json', 
          Authorization: `${token}` 
        }
      }
    );

    if (response.status !== 200) {
      throw new Error('Failed to update order');
    }

    // Update local state with the new order values
    setDetails(updatedDetails.map((item, index) => ({
      ...item,
      item_order: index + 1
    })));

  } catch (error) {
    console.error('Failed to update order:', error);
  }
};


  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">About This Product Items</h3>
      
      <div className="flex space-x-2">
        <input
          type="text"
          value={newDetail}
          onChange={(e) => setNewDetail(e.target.value)}
          placeholder="Add new about point"
          className="flex-1 p-2 border rounded"
        />
        <button 
          onClick={handleAddDetail}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Add
        </button>
      </div>
      
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="abouts">
          {(provided) => (
            <ul 
              {...provided.droppableProps} 
              ref={provided.innerRef}
              className="space-y-2"
            >
              {abouts.sort((a, b) => a.item_order - b.item_order).map((detail, index) => (
                <Draggable key={detail.id} draggableId={detail.id.toString()} index={index}>
                  {(provided) => (
                    <li
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className="p-3 border rounded bg-white flex items-center"
                    >
                      <span className="mr-3">☰</span>
                      <span>{detail.about_text}</span>
                    </li>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </ul>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default ProductAboutsEditor;