import React, { useContext, useEffect } from 'react'
import { UserContext } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
import { API_PATHS } from '../utils/apiPaths';
export const useUserAuth = () => {
    const { user, updateUser, clearUser } = useContext(UserContext);
    const navigate = useNavigate();
    useEffect(() => {
        if(user) return;

        let isMounted = true; // To prevent state updates if the component is unmounted

        const fetchUserInfo = async () => {
            try{
                const response = await axiosInstance.get(API_PATHS.AUTH.USER_INFO);
                if (response.data && isMounted) {
                    updateUser(response.data);
                }
            }catch(error){
                console.error("Error fetching user info:", error);
                if(isMounted){
                    clearUser();
                    navigate("/login");
                }
            }
        };
        fetchUserInfo();

        return () => {
            isMounted = false;
        };
    }, [updateUser, clearUser, navigate]);
};
