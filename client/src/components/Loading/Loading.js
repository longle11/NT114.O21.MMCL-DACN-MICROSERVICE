import React from 'react'
import { useSelector } from 'react-redux'

export default function Loading() {
    const isLoading = useSelector(state => state.loading.isLoading)
    return (
        <>
            {
                isLoading ? (
                    <>
                        <img style={{ width: '100%', height: '100vh', objectFit: 'none' }} src={require('../../assets/loading.gif')} alt='loading' />
                    </>) : ''
            }
        </>
    )
}
