


import "../ordersComponent/modal.css"

import React,{useState,useEffect} from  "react";
import SummaryTable from "../ordersComponent/SummaryTable";
const Popuplist = ({finaldata,handleClose}) => {
  
  const [subTotal, setsubTotal] = useState(0)
  const [finalOrdervalue, setfinalOrderValue] = useState(0)
  const [totalItems, settotalTtems] = useState(0)

  useEffect(() => {
    let totalval=0
    let itemsconut=0
    finaldata.forEach(element => {
      totalval+=element.subprice
      itemsconut+=  +element.quantity
    });
    setsubTotal(totalval)
    settotalTtems(itemsconut)
  const deliveryCharge=90  
  let finalOrder=totalval+deliveryCharge
  setfinalOrderValue(finalOrder)

  }, [finaldata]);




  return (

    <div className="popup-box">

    <div className="box">

    <header className="summary-bar">
        
      <p>Summary</p>
       <p className="close-icon" onClick={handleClose}>x</p>
     
    </header>

    <div className="address-info">

    <div className="location">
      <div>
      <h4>jp Nagar</h4>
      <i className="fa fa-angle-down"></i>
      </div>
      <div className='under-line'></div>
    </div>  
    <div className="location">
      <h3>Store Address:</h3>
      <p>Near Phone Booth, 10th Cross</p>
    </div>
    <div className="location">
      <h3>Phone:</h3>
      <p>+ 91 999 000 99 00</p>
    </div>
  </div > 

  <h5 className="order-detail">Order Details</h5>

<div className="summary-order">
{finaldata.map((item,index)=>{
return (<>
    <SummaryTable item={item} setsubTotal={setsubTotal}  subTotal = {subTotal} key={index} />
  <div className="under-line sum-line"></div>
  </>
    )})}

<div className="price-cont">
<div className="sub-total price">
      <p>total :</p>
      <h3>{subTotal} </h3>
      </div> 
        <div className="price-line"></div>
        </div>
<div className="price-cont">
<div className="sub-total price">
      <p>pickUp Charge:</p>
      <h3>90</h3>
      </div> 
        <div className="price-line"></div>
        </div>


<div className=" summary-bar  price-bar">
<div className="sub-total price-cont price allign">
      <p>Total </p>
      <h3>Rs {finalOrdervalue}</h3>
      </div> 
        </div>

        </div>  
  <div className="price-line"></div>
  
<div className="address-title"><h4>Address</h4> </div>

<section className="add-new-address">
   <div className="default-add">
      <h4>Home</h4>
       <p>#100,3rd Main, 4thcross,
         RajajiNagar, Bengaluru,560010
       </p>
      </div>

    
      
    </section>
<footer className="foot">
<button className="con-firm" type="submit" onClick={handleClose}>Close</button>

 </footer>  
    </div>
    </div>
  );
};
 
export default Popuplist;


