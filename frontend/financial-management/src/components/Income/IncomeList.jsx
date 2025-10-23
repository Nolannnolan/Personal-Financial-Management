import React from 'react'
import TransactionInfoCard from '../Cards/TransactionInfoCard'
import moment from 'moment'

const IncomeList = ({transactions, onDelete, onDownload}) => {
  return (
    <div className = "card">
        <div className='flex items-center justify-between'>
            <div className=''>
                <h5 className='text-lg'>Income Source</h5>
            </div>

            <button className='card-btn' onClick={onDownload}>
                <i className="fa-solid fa-download text-base"></i>
                Download
            </button>
        </div>

        <div className = "grid grid-cols-1 md:grid-cols-2">
            {transactions?.map((income) =>(
                <TransactionInfoCard
                    key={income._id}
                    title = {income.source}
                    icon = {income.icon}
                    date = {moment(income.date).format("Do MMM YYYY")}
                    amount={income.amount}
                    type="income"
                    onDelete={()=>onDelete(income._id)}
                />
            ))}
        </div>
    </div>
  )
}

export default IncomeList
