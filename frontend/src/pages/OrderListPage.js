import React, { useState } from "react";
import { useStateContext } from "../contexts/ContextProvider";
import OrderForm from '../components/OrderForm';
import OrderList from '../components/OrderModal';

const OrderListPage = () => {
  const { currentColor } = useStateContext();
  const [orders, setOrders] = useState([]);
  

  const handleOrderCreated = (newOrder) => {
    setOrders([...orders, newOrder]);
  };

  return (
    <div>
      <h1>Order Management</h1>
      {/* Create Order Form */}
      <OrderForm onOrderCreated={handleOrderCreated} />
      {/* Order List with Search and Filter */}
      <OrderList />
    </div>
  );
};

export default OrderListPage;
