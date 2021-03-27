import React, { createContext, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { deleteSingleCartItemFn, updateCartQuantityFn } from "../functions/cart";
import { Image } from "antd";
import getRefreshToken from "../helper/getRefreshToken";
import { refreshTokenFn } from "../functions/auth";
import { getProductQuantityFn } from "../functions/product";

const Cart = () => {
    const { cart, user } = useSelector(state => {
        return { ...state }
    });

    const dispatch = useDispatch();
    //state
    const [promoCode, setPromoCode] = useState("");
    const [itemsTotal, setItemsTotal] = useState(0);
    const [discount, setDiscount] = useState(0);
    const [totalPayable, setTotalPayable] = useState(0);
    const getDBProductQuantity =  () => {
        console.log("DB cart here");
        let isUpdated = false;
        let checkQuantityCart = cart.map(product => {
            if (product.quantity > product.availableQuantity) {
                isUpdated = true;
                product.quantity = product.availableQuantity
            }
            return product;
        });
        if (isUpdated) {
            dispatch({
                type: "UPDATE_CART",
                payload: checkQuantityCart
            });
        }
    };

    useEffect(() => {
        
        if(!user||!user.email||!user.token) {
            console.log("aabb");
            getDBProductQuantity();
        }        
    },[]);

    useEffect(() => {
        //reduce takes in a function as first parameter, 2nd parameter is the starting value,
        //on the first loop current value is 0 thus we use the nextValue price * quantity which is the first array of the cart
        const totalPrice = cart.reduce((currentValue, nextValue) => {
            return currentValue + (nextValue.price * nextValue.quantity);
        }, 0);
        setItemsTotal(totalPrice);
        setTotalPayable(totalPrice);
    }, [cart]);

    const displayCartItemHeader = () => {
        return (
            <>
                <div className="row mb-3">
                    <div className="col-md-6 font-weight-bold">
                        Products
                </div>
                    <div className="col-md-2 font-weight-bold">
                        Price
                </div>
                    <div className="col-md-2 font-weight-bold">
                        Quantity
                </div>
                    <div className="col-md-2 font-weight-bold">
                        Total Price:
                </div>
                </div>
                <hr />
            </>
        )
    }

    const displayCartItemContent = () => {
        return (cart.map((c) => {
            return (
                <div key={c._id}>
                    <div className="row" >
                        <div className="col-md-6">
                            <div className="row">
                                <div className="col-md-4">
                                    <Link
                                        to={`productDetails/${c.slug}`}>
                                        <Image
                                            src={`${process.env.REACT_APP_AWSS3DIR}/${c.images[0]}`}
                                            preview={false}
                                            width={100}
                                        />
                                    </Link>
                                </div>
                                <div className="col-md-8">
                                    <div className="font-weight-bold">{c.name}</div>
                                    <div>{c.description}</div>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-2">
                            SGD${c.price}
                        </div>
                        <div className="col-md-2">
                            <input
                                className="form-control-sm mr-sm-2 w-75"
                                type="number"
                                value={c.quantity}
                                onChange={(event) => handleQuantityChange(event, c)}
                            />
                            <br />
                            <div className="font-weight-light font-italic">{c.availableQuantity} Remaining</div>
                        </div>
                        <div className="col-md-2">
                            SGD${c.price * c.quantity}
                            <br />
                            <a onClick={() => handleSingleRemoveItem(c)} className="text-danger">Remove</a>
                        </div>
                    </div>
                    <hr />
                </div>
            )
        }));
    }

    const handlePromoCode = () => {

    }

    const handleQuantityChange = async (event, singleCartItem) => {
        //make quantity at least 1
        let quantity = parseInt(event.target.value) < 1 ? 1 : parseInt(event.target.value);
        //check max quanity
        quantity = quantity >= singleCartItem.availableQuantity ? singleCartItem.availableQuantity : quantity;
        //if user logged in update cart is to update db
        if (user && user.email && user.token) {
            const productObj = {};
            productObj.productID = singleCartItem._id;
            productObj.updateQuantity = quantity;
            try {
                const res = await updateCartQuantityFn(productObj, user.token);
                //update redux 
                dispatch({
                    type: "UPDATE_CART",
                    payload: res.data
                });
            } catch (err) {
                if (err.response.data.error === "J01") {
                    const rfAuthToken = getRefreshToken();
                    if (rfAuthToken) {
                        try {
                            const res2 = await refreshTokenFn(rfAuthToken);
                            //update redux state
                            dispatch({
                                type: "REFRESH_TOKEN",
                                payload: res2.data
                            });
                            const res3 = await updateCartQuantityFn(singleCartItem._id, res2.data.token);
                            dispatch({
                                type: "UPDATE_CART",
                                payload: res3.data
                            });
                        } catch (err) {
                            // setResponse({ ...response, message: err.response.data.error, css: "danger" });
                        }
                    }
                } else { //fail not because of auth token
                    // setResponse({ ...response, message: err.response.data.error, css: "danger" });
                }
            }


        } else {
            //set localstorage and redux state
            if (typeof window !== "undefined") {
                if (localStorage.getItem("cart")) {
                    let localStorageCart = JSON.parse(localStorage.getItem("cart"));
                    localStorageCart.map(lsc => {
                        if (lsc._id === singleCartItem._id) {
                            lsc.quantity = quantity;
                        }
                        return lsc;
                    });
                    localStorage.setItem("cart", JSON.stringify(localStorageCart));
                    //update redux 
                    dispatch({
                        type: "UPDATE_CART",
                        payload: localStorageCart
                    });
                }
            }
        }
    }

    const displayOrderSummary = () => {
        return (
            <div className="border p-3">
                <div className="row">
                    <h4 className="col">Order Summary</h4>
                </div>
                <div className="row">
                    <div className="col">Promo Code</div>
                </div>
                <div className="row mt-1">
                    <div className="col-md-8">
                        <input
                            type="text"
                            value={promoCode}
                            className="form-control mt-1"
                            onChange={handlePromoCode}
                            placeholder="Promo Code here"
                        />
                    </div>
                    <div className="col-md-4">
                        <button
                            type="button"
                            className="btn btn-sm btn-outline-dark">
                            Apply
                    </button>
                    </div>
                </div>
                <hr />
                <div className="row mb-1 mr-1">
                    <div className="col">Items Total : </div>
                    <div className="ml-auto">SGD${itemsTotal}</div>
                </div>
                <div className="row mr-1 ">
                    <div className="col">Discounts:</div>
                    <div className="ml-auto"><div className="text-danger">-SGD${discount}</div></div>
                </div>
                <hr />
                <div className="row mb-1 mr-1">
                    <div className="col">Total Payable</div>
                    <div className="ml-auto ">SGD${totalPayable}</div>
                </div>
                <div className="row mt-3">
                    <div className="col">
                        {user && user.email && user.token ?
                            (<Link
                                type="button"
                                className="btn btn-warning w-100 mr-auto ml-auto text-light"
                                to={{
                                    pathname: "/Checkout"
                                }}
                                disabled={cart.length === 0}>Proceed To Checkout
                            </Link>) : (<Link
                                type="button"
                                className="btn btn-warning w-100 mr-auto ml-auto text-light"
                                to={{
                                    pathname: "/login",
                                    state: {
                                        redirectedFrom: "cart"
                                    }
                                }}
                                disabled={cart.length === 0}>Proceed To Checkout
                            </Link>)
                        }

                    </div>
                </div>
            </div>
        )
    }

    const displayNoItemInCart = () => {
        return (
            <h1 className="mr-auto ml-auto">Cart is empty</h1>
        )
    }

    const handleSingleRemoveItem = async c => {
        if (typeof window !== "undefined") {
            if (user && user.email && user.token) { //user logged in, delete document from db
                try {
                    const res = await deleteSingleCartItemFn(c._id, user.token);
                    //update redux
                    dispatch({
                        type: "DELETE_SINGLE_CART_ITEM",
                        payload: res.data
                    });
                } catch (err) {
                    if (err.response.data.error === "J01") {
                        const rfAuthToken = getRefreshToken();
                        if (rfAuthToken) {
                            try {
                                const res2 = await refreshTokenFn(rfAuthToken);
                                //update redux state
                                dispatch({
                                    type: "REFRESH_TOKEN",
                                    payload: res2.data
                                });
                                const res3 = await deleteSingleCartItemFn(c._id, res2.data.token);
                                dispatch({
                                    type: "DELETE_SINGLE_CART_ITEM",
                                    payload: res3.data
                                });
                            } catch (err) {
                                // setResponse({ ...response, message: err.response.data.error, css: "danger" });
                            }
                        }
                    } else { //fail not because of auth token
                        // setResponse({ ...response, message: err.response.data.error, css: "danger" });
                    }
                }
            } else { //user not logged in, update localstorage
                const filteredCart = cart.filter(cartItem => {
                    return cartItem._id !== c._id
                });
                localStorage.setItem("cart", JSON.stringify(filteredCart));
                //update redux 
                dispatch({
                    type: "UPDATE_CART",
                    payload: filteredCart
                });
            }
        }
    }


    return (
        <>
            {/* {JSON.stringify(cart)} */}
            <div className="row mt-4">
                {cart.length > 0 ? (<>
                    <div className="col-md-8">
                        {displayCartItemHeader()}
                        {displayCartItemContent()}
                    </div>
                    <div className="col-md-4">
                        {displayOrderSummary()}

                    </div>
                </>)
                    :
                    (<div className="ml-auto mr-auto">{displayNoItemInCart()}</div>)}
            </div>



        </>
    )
};

export default Cart;