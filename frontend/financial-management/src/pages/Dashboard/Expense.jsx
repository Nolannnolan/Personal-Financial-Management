import React, { useEffect, useState } from 'react'
import { useUserAuth } from '../../hooks/useUserAuth';
import DashBoardLayout from '../../components/layouts/DashboardLayout';
import { API_PATHS } from '../../utils/apiPaths';
import axiosInstance from '../../utils/axiosInstance';
import toast from 'react-hot-toast';
import ExpenseOverview from '../../components/Expense/ExpenseOverview';
import Modal from '../../components/Modal';
import AddExpenseForm from '../../components/Expense/AddExpenseForm';
import ExpenseList from '../../components/Expense/ExpenseList';
import DeleteAlert from '../../components/DeleteAlert';

const Expense = () => {
  useUserAuth();

  const [expenseData, setExpenseData] = useState([])
  const [openAddExpenseModal, setOpenAddExpenseModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [openDeleteAlert, setOpenDeleteAlert] = useState({
    show: false,
    data: null
  })

  // Get All Expense Details
  const fetchExpenseData = async () =>{
    if(loading) {
      return;
    }
    setLoading(true);

    try{
      const response = await axiosInstance.get(`${API_PATHS.EXPENSE.GET_ALL_EXPENSE}`)
      if (response.data){
        setExpenseData(response.data);
        console.log("Expense Data: ", response.data)
      }  
    } catch (error) {
      console.log("Someting went wrong. Please try again later.", error);
    } finally {
      setLoading(false);
    }

  }

  //Handle Add Expense
  const handleAddExpense = async(expense)=>{
    const {category, amount, date, icon} = expense;

    // Validation Checks
    if(!category.trim()){
      toast.error("Category is required.")
      return
    }

    if(!amount || isNaN(amount) || Number(amount) <=0){
      toast.error("Amount should be a valid number greater than 0.")
      return
    }

    if(!date) {
      toast.error("Date is required.")
      return
    }

    try{
      await axiosInstance.post(API_PATHS.EXPENSE.ADD_EXPENSE, {
        category,
        amount,
        date,
        icon
      });

      setOpenAddExpenseModal(false);
      toast.success("Expense added successfully")
      fetchExpenseData();

    }catch(error){
      console.error(
        "Error adding expense:",
        error.response?.data?.message || error.message
      )
    }
  }

    // Delete Expense
  const deleteExpense = async(id) => {
    try{
      await axiosInstance.delete(API_PATHS.EXPENSE.DELETE_EXPENSE(id))

      setOpenDeleteAlert({show: false, data: null})
      toast.success("Expense details delete successfully")
      fetchExpenseData()
    }catch(error){
      console.error(
        "Error deleting expense:",
        error.response?.data?.message || error.message
      )
    }
  }

  // Handle Download Expense Details
  const handleDownloadExpenseDetails = async() =>{

  }

  useEffect(()=>{
    fetchExpenseData()
    return()=>{}
  }, [])
  return (

    <DashBoardLayout activeMenu="Expense">
      <div className='my-5 mx-auto'>
        <div className = "grid grid-cols-1 gap-6">
          <div className=''>
            <ExpenseOverview
              transactions={expenseData}
              onAddExpense={() => setOpenAddExpenseModal(true)}
            />
          </div>
        </div>

        <ExpenseList
          transactions = {expenseData}
          onDelete={(id)=>{
              setOpenDeleteAlert({show: true, data: id})
            }
          } 
          onDownload={handleDownloadExpenseDetails}
        />

        <Modal
          isOpen = {openAddExpenseModal}
          onClose = {() => setOpenAddExpenseModal(false)}
          title="Add Expense"
        >
          <AddExpenseForm onAddExpense={handleAddExpense}/>
        </Modal>

        <Modal
          isOpen = {openDeleteAlert.show}
          onClose = {() => setOpenDeleteAlert({show: false, data: null})}
          title="Delete Expense"
        >
          <DeleteAlert
            content="Are you sure you want to delete this expense detail?"
            onDelete = {() => deleteExpense(openDeleteAlert.data)}
          />
        </Modal>
      </div>
    </DashBoardLayout>
  )
}

export default Expense
