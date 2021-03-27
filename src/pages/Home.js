import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { getProductsBySearchFilterFn } from "../functions/product";
import ProductCard from "../components/ProductCard";
import LoadingCard from "../components/LoadingCard";
import Typewriter from "typewriter-effect";
import { MDBCard } from 'mdbreact';
import LatestCookies from "../components/LatestCookies";
import BestSellers from "../components/BestSellers";
const Home = () => {

    const typeWriter = () => {
        return <Typewriter
            options={{
                strings: "The Best Protein Cookie",
                autoStart: true,
                loop: true
            }}
        />
    }
    return (
        <>
            <div className="text-danger h1 font-weight-bold text-center pt-3">{typeWriter()}</div>
            <LatestCookies/>
            <BestSellers/>
        </>
    )
};

export default Home;