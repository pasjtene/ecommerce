import React, { FC } from 'react';
import { useFormik } from 'formik';
import dayjs from 'dayjs';
import Modal, {
    ModalBody,
    ModalFooter,
    ModalHeader,
    ModalTitle,
} from '../../../components/bootstrap/Modal';
import data from '../../../common/data/dummyCustomerData';
import showNotification from '../../../components/extras/showNotification';
import Icon from '../../../components/icon/Icon';
import FormGroup from '../../../components/bootstrap/forms/FormGroup';
import Input from '../../../components/bootstrap/forms/Input';
import Card, {
    CardBody,
    CardHeader,
    CardLabel,
    CardTitle,
} from '../../../components/bootstrap/Card';
import Button from '../../../components/bootstrap/Button';
import Label from '../../../components/bootstrap/forms/Label';
import Checks, { ChecksGroup } from '../../../components/bootstrap/forms/Checks';
import PAYMENTS from '../../../common/data/enumPaymentMethod';
import { updateUser, createUser } from '../auth/api';
import { User, Role } from '../auth/types'



interface ICustomerEditModalProps {
   
    id: string;
    isOpen: boolean;
    setIsOpen(...args: unknown[]): unknown;
    isNewUser?: boolean;
    formData: UserFormData;
    formData2: UserFormData2;
    availableRoles: Role[];
    onFormChange: (updatedData: UserFormData) => void;
    onFormChange2: (updatedData2: UserFormData2) => void;
    onSave: (formData: UserFormData) => void;
    onUserUpdated: (updatedUser: User) => void;
}
interface UserFormData {
    id: number,
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    roles: Role[];
  }
  interface UserFormData2 {
    id: number,
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    roles: number[];
  }
const UserCreateModal: FC<ICustomerEditModalProps> = ({
   id,
    isOpen,
    setIsOpen,
    isNewUser = false,
    formData,
    formData2,
    availableRoles,
    onFormChange,
    onFormChange2,
    onSave,
    onUserUpdated
}) => {
    const itemData = id ? data.filter((item) => item.id.toString() === id.toString()) : {};
    const item = id && Array.isArray(itemData) ? itemData[0] : {};
     // Handle input changes for text fields
     const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        
        onFormChange({
            ...formData,
            [name]: value,
        });

        onFormChange2({
            ...formData2,
            [name]: value,
        });


    };

     // Handle role toggling
     const handleRoleToggle = (role: Role, isChecked: boolean) => {
        const updatedRoles = isChecked
            ? [...formData.roles, role]
            : formData.roles.filter((r) => r.ID !== role.ID);
        
            const updatedRoles2 = isChecked
            ? [...formData2.roles.map((r)=>r), role.ID]
            : formData2.roles.filter((r) => r !== role.ID);

        onFormChange2({
            ...formData2,
            roles: updatedRoles2,
        });

        onFormChange({
            ...formData,
            roles: updatedRoles,
        });
    };
    
       
    const formik = useFormik({
        initialValues: {
            name: formData.first_name,
            email: formData?.email || '',
            membershipDate: dayjs(item?.membershipDate).format('YYYY-MM-DD') || '',
            type: item?.type || 'Author',
            streetAddress: item?.streetAddress || '',
            streetAddress2: item?.streetAddress2 || '',
            city: item?.city || '',
            stateFull: item?.stateFull || '',
            zip: item?.zip || '',
            streetAddressDelivery: item?.streetAddressDelivery || '',
            streetAddress2Delivery: item?.streetAddress2Delivery || '',
            cityDelivery: item?.cityDelivery || '',
            stateFullDelivery: item?.stateFullDelivery || '',
            zipDelivery: item?.zipDelivery || '',
            payoutType: item?.payout || '',
        },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        onSubmit: (values) => {
            console.log("The values", values)
            setIsOpen(false);
            showNotification(
                <span className='d-flex align-items-center'>
                    <Icon icon='Info' size='lg' className='me-1' />
                    <span>Updated Successfully</span>
                </span>,
                'Customer has been updated successfully',
            );
        },
    });

      // Handle form submission
      const handleSubmit1 = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
        console.log("Data to save", formData)
        setIsOpen(false);
        showNotification(
            <span className='d-flex align-items-center'>
                <Icon icon='Info' size='lg' className='me-1' />
                <span>User {isNewUser ? 'created' : 'updated'} successfully</span>
            </span>,
            `User has been ${isNewUser ? 'created' : 'updated'} successfully`,
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
       // setIsLoading(true);
       // setError(null);
        
        try {
          const response = await createUser(formData2);
          console.log("The data", formData2)
          console.log("The updated user response data", response.user)

          onUserUpdated(response.user);

          setIsOpen(false);

        } catch (err) {
          //setError('Failed to update user. Please try again.');
          console.error('Update error:', err);
        } finally {
         // setIsLoading(false);
          console.log("This is final")
        }
      };



    if (id || id === '0') {
        return (
            <Modal isOpen={isOpen} setIsOpen={setIsOpen} size='xl' titleId={id.toString()}>
                <ModalHeader setIsOpen={setIsOpen} className='p-4'>
                    {isNewUser? (<ModalTitle id={id}>{'Create New User'}</ModalTitle>):
                    (<ModalTitle id={id}>{formData.first_name} {formData.last_name}</ModalTitle>)}
                </ModalHeader>
                <ModalBody className='px-4'>
                    <div className='row g-4'>
                        
                        <FormGroup id='first_name' label='First Name' className='col-md-3'>
                        <Input name='first_name' onChange={handleInputChange} value={formData.first_name}  />      
                        </FormGroup>
                        
                        <FormGroup id='last_name' label='Last Name' className='col-md-3'>
                            <Input
                                name='last_name'
                                onChange={handleInputChange}
                                value={formData.last_name}
                            />
                        </FormGroup>
                       
                        <FormGroup id='email' label='Email' className='col-md-3'>
                            <Input
                                name='email'
                                onChange={handleInputChange}
                                value={formData.email}
                            />
                        </FormGroup>
                        <FormGroup id='membershipDate' label='Membership' className='col-md-3'>
                            <Input
                                type='date'
                                onChange={formik.handleChange}
                                value={formik.values.membershipDate}
                                disabled
                            />
                        </FormGroup>

                        <FormGroup id='roles' label='Roles' className='col-12'>
                            <ChecksGroup isInline>
                                {availableRoles.map((role) => (
                                    <Checks
                                        key={role.ID}
                                        type='checkbox'
                                        id={`role-${role.ID}`}
                                        label={role.Name}
                                        name='roles'
                                        value={role.ID.toString()}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleRoleToggle(role, e.target.checked)}
                                        checked={formData.roles.some((r) => r.ID === role.ID)}
                                    />
                                ))}
                            </ChecksGroup>
                        </FormGroup>
                        <span>
                        Visual confirm Roles
                        </span>
                        
                        <FormGroup>
                            <Label htmlFor='user_roles'>User Roles</Label>
                            <ChecksGroup isInline>
                            {availableRoles.map(r => (
                                 <Checks
                                disabled={false}
                                type='switch'
                                 key={r.ID}
                                 id={r.Name}
                                 label={r.Name}
                                 name='user_roles'
                                 value={r.Name}
                                 onChange={formik.handleChange}
                                 checked={formData.roles.some(i=>i.Name===r.Name)}
                             />
                            ))}
                               
                            </ChecksGroup>
                        </FormGroup>
                        <div className='col-md-6'>
                            <Card className='rounded-1 mb-0'>
                                <CardHeader>
                                    <CardLabel icon='ReceiptLong'>
                                        <CardTitle>Billing Address</CardTitle>
                                    </CardLabel>
                                </CardHeader>
                                <CardBody>
                                    <div className='row g-3'>
                                        <FormGroup
                                            id='streetAddress'
                                            label='Address Line'
                                            className='col-12'>
                                            <Input
                                                onChange={formik.handleChange}
                                                value={formik.values.streetAddress}
                                            />
                                        </FormGroup>
                                        <FormGroup
                                            id='streetAddress2'
                                            label='Address Line 2'
                                            className='col-12'>
                                            <Input
                                                onChange={formik.handleChange}
                                                value={formik.values.streetAddress2}
                                            />
                                        </FormGroup>
                                        <FormGroup id='city' label='City' className='col-md-4'>
                                            <Input
                                                onChange={formik.handleChange}
                                                value={formik.values.city}
                                            />
                                        </FormGroup>
                                        <FormGroup
                                            id='stateFull'
                                            label='State'
                                            className='col-md-4'>
                                            <Input
                                                onChange={formik.handleChange}
                                                value={formik.values.stateFull}
                                            />
                                        </FormGroup>
                                        <FormGroup id='zip' label='Zip' className='col-md-4'>
                                            <Input
                                                onChange={formik.handleChange}
                                                value={formik.values.zip}
                                            />
                                        </FormGroup>
                                    </div>
                                </CardBody>
                            </Card>
                        </div>
                        <div className='col-md-6'>
                            <Card className='rounded-1 mb-0'>
                                <CardHeader>
                                    <CardLabel icon='LocalShipping'>
                                        <CardTitle>Delivery Address</CardTitle>
                                    </CardLabel>
                                </CardHeader>
                                <CardBody>
                                    <div className='row g-3'>
                                        <FormGroup
                                            id='streetAddressDelivery'
                                            label='Address Line'
                                            className='col-12'>
                                            <Input
                                                onChange={formik.handleChange}
                                                value={formik.values.streetAddressDelivery}
                                            />
                                        </FormGroup>
                                        <FormGroup
                                            id='streetAddress2Delivery'
                                            label='Address Line 2'
                                            className='col-12'>
                                            <Input
                                                onChange={formik.handleChange}
                                                value={formik.values.streetAddress2Delivery}
                                            />
                                        </FormGroup>
                                        <FormGroup
                                            id='cityDelivery'
                                            label='City'
                                            className='col-md-4'>
                                            <Input
                                                onChange={formik.handleChange}
                                                value={formik.values.cityDelivery}
                                            />
                                        </FormGroup>
                                        <FormGroup
                                            id='stateFullDelivery'
                                            label='State'
                                            className='col-md-4'>
                                            <Input
                                                onChange={formik.handleChange}
                                                value={formik.values.stateFullDelivery}
                                            />
                                        </FormGroup>
                                        <FormGroup
                                            id='zipDelivery'
                                            label='Zip'
                                            className='col-md-4'>
                                            <Input
                                                onChange={formik.handleChange}
                                                value={formik.values.zipDelivery}
                                            />
                                        </FormGroup>
                                    </div>
                                </CardBody>
                            </Card>
                        </div>
                    </div>
                </ModalBody>
                

                <ModalFooter className='px-4 pb-4'>
                <Button color='secondary' onClick={() => setIsOpen(false)}>
                    Cancel
                </Button>
                <Button color='primary' onClick={handleSubmit}>
                    {isNewUser ? 'Create User' : 'Save Changes'}
                </Button>
            </ModalFooter>

            </Modal>
        );
    }
    return null;
};

export default UserCreateModal;