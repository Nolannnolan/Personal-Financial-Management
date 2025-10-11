import React, {useContext, useState} from 'react'
import AuthLayout from '../../components/layouts/AuthLayout'
import { Link } from 'react-router-dom'
import Input from '../../components/Inputs/Input'
import { validateEmail, validatePassword } from '../../utils/helper'
import ProfilePhotoSelector from '../../components/Inputs/ProfilePhotoSelector'
import axiosInstance from '../../utils/axiosInstance'
import { API_PATHS } from '../../utils/apiPaths'
import { UserContext } from '../../context/UserContext'
import { useNavigate } from 'react-router-dom'
const SignUp = () => {
  const [profilePic, setProfilePic] = useState(null)
  const [fullName, setFullName] = useState()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()
  const [error, setError] = useState('')

  const {updateUser} = useContext(UserContext);

  // Handle Sign Up Form Submit
  const handleSignUp = async(e)=>{
    e.preventDefault()

    if(!fullName){
      setError("Please enter your full name");
      return;
    }
    if(!validateEmail(email)){
      setError('Please enter a valid email address.');
      return;
    }
    if(validatePassword(password)){
      setError(validatePassword(password));
      return;
    }
  
    setError("")

    // SignUp API Call
  try {
    console.log(fullName, email, password);
    const response = await axiosInstance.post(API_PATHS.AUTH.REGISTER, {
      fullName,
      email,
      password,
    });

    const { token, user } = response.data;
    console.log(user);
    if (token) {
      localStorage.setItem("token", token);
      updateUser(user);
      navigate("/dashboard");
    }
  } catch (error) {
    if (error.response && error.response.data.message) {
      setError(error.response.data.message);
    } else {
      setError("Something went wrong. Please try again.");
    }
  }
}
  return (
    <AuthLayout>
      <div className = "lg:w-[100%] h-auto md:h-full mt-10 md:mt-0 flex flex-col justify-center">
        <h3 className='text-xl font-semibold text-black'>
          Create an account
        </h3>
        <p className='text-xs text-slate-700 mt-[5px] mb-6'>
          Join us today by entering your details below.
        </p>
        <form onSubmit={handleSignUp}>

          <ProfilePhotoSelector image={profilePic} setImage={setProfilePic}></ProfilePhotoSelector>

          <div className='grid gird-cols-1 md:grid-cols-2 gap-4'>
            <Input
              value = {fullName}
              onChange = {({target}) => setFullName(target.value)}
              label = "Full Name"
              placeholder = "Enter your full name"
              type = "text"
            ></Input>
            <Input
              value = {email}
              onChange = {({target}) => setEmail(target.value)}
              label = "Email Address"
              placeholder = "Enter your email"
              type = "text"
            ></Input>

            <div className = "col-span-2">
              <Input
                value = {password}
                onChange = {({target}) => setPassword(target.value)}
                label = "Password"
                placeholder = "Enter your password"
                type = "password"
              ></Input>
            </div>
          </div>
          {error && <p className='text-red-500 text-xs pb-2.5'>{error}</p>}
          
          <button type = "submit" className = "btn-primary">SIGN UP</button>
          <p className='text-[13px] text-slate-800 mt-3'>
            Already have an account?{" "}
            <Link className='text-primary font-medium cursor-pointer underline' to="/login" >Login</Link>
          </p>
        </form>
      </div>
    </AuthLayout>
  )
}

export default SignUp
