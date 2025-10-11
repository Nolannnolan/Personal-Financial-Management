import React from 'react'
import DashBoardLayout from '../../components/layouts/DashboardLayout'
import { useUserAuth } from '../../hooks/useUserAuth';

const Home = () => {
  useUserAuth();
  return (
    <DashBoardLayout activeMenu="Dashboard">
      <div className='my-5 mx-auto'>
        Home
      </div>
    </DashBoardLayout>
  )
}

export default Home
