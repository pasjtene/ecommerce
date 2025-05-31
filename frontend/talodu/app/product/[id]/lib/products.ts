export async function getProductById(id: string) {
    const fakeDB = {
      '1': { name: 'Cool T-Shirt', description: 'A very cool t-shirt for summer.' },
      '2': { name: 'Nice Hat', description: 'A stylish hat for all seasons.' },
    };
  
    return fakeDB[id] || null;
  }