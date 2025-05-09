import React, { useEffect, useState } from "react";
import { updateOrder, createOrder } from "../services/orderService";
import { toast } from "react-toastify";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { IoClose } from "react-icons/io5";
import {
  fetchBrands,
  fetchCustomers,
  fetchFabrics,
  fetchFabricSuppliers,
  fetchStyles,
} from "../services/masterDataService";
import { ShoppingCart, ClipboardList, AlertCircle } from "lucide-react";

const OrderModal = ({
  closeModal,
  onOrderCreated,
  editOrder,
  updateOrderInList,
  currentColor,
}) => {
  const [formData, setFormData] = useState({
    customer: null,
    brand: null,
    season: "",
    orderNo: "",
    orderQty: "",
    orderDate: new Date().toLocaleDateString(),
    deliveryDate: new Date("2015-03-25").toLocaleDateString(),
    style: null,
    styleNo: "",
    keyNo: "",
    articleNo: "",
    fabricSupplier: null,
    fabric: null,
    //fabricComposition: "",
    //emessaOrderNo: "",
    //line: "",
    //deliveredQty: "",
    //currentStage: "Fabric Reservation",
    //stageProgress: 0,
    //barcode7: "",
  });
  const [customers, setCustomers] = useState([]);
  const [brands, setBrands] = useState([]);
  const [filteredBrands, setFilteredBrands] = useState([]);
  const [filteredStyles, setFilteredStyles] = useState([]);

  const [styles, setStyles] = useState([]);
  const [fabricSuppliers, setFabricSuppliers] = useState([]);
  const [fabrics, setFabrics] = useState([]);
  const [errors, setErrors] = useState({});

  // Load master data on component mount
  useEffect(() => {
    const loadMasterData = async () => {
      try {
        const [stylesData, customersData, suppliersData, fabricsData, brandsData] = await Promise.all([
          fetchStyles(),
          fetchCustomers(),
          fetchFabricSuppliers(),
          fetchFabrics({
          page: 1,
          limit: 1000,
          sortField: "name",
          sortOrder: "desc",
          search:"",
          }),
          fetchBrands(),
        ]);
        setStyles(stylesData);
        setCustomers(customersData);
        setFabricSuppliers(suppliersData);
        setFabrics(fabricsData.data);
        setBrands(brandsData);
      } catch (error) {
        console.error("Error loading master data:", error);
      }
    };
    loadMasterData();
  }, []);

  // Initialize form data when editing an order 
  useEffect(() => {
    if (editOrder && customers.length && brands.length && styles.length && fabrics.length && fabricSuppliers.length) {
      console.log("editOrder: ", editOrder);
      const mappedEditOrder = {
        ...editOrder,
        customer: customers.find(c => c._id === editOrder.customer?._id) || null,
        brand: brands.find(b => b._id === editOrder.brand?._id) || null,
        style: styles.find(s => s._id === editOrder.style?._id) || null,
        fabric: fabrics.find(f => f._id === editOrder.fabric?._id) || null,
        fabricSupplier: fabricSuppliers.find(fs => fs._id === editOrder.fabricSupplier?._id) || null,
      };
      setFormData(mappedEditOrder); // Load order data for editing
    }
    //console.log("editOrder: ", editOrder);
  }, [editOrder, customers, brands, styles, fabrics, fabricSuppliers]);

  // Filter brands based on selected customer
  useEffect(() => {
    if (formData.customer) {
      const filtered = brands.filter(b => b.customer === formData.customer?._id);
      setFilteredBrands(filtered);
      
      // Keep brand if it's still valid, otherwise reset it
      setFormData(prev => ({
        ...prev,
        brand: filtered.some(b => b._id === prev.brand?._id) ? prev.brand : "",
      }));
    }
  }, [formData.customer, brands]);

  useEffect(() => {
    if (formData.brand) {
      const filtered = styles.filter(
        (s) => s.brand?._id === formData.brand?._id // ✅ Be sure both are ObjectId or strings
      );
      setFilteredStyles(filtered);
  
      // Optional: clear style if it's not under the selected brand
      setFormData((prev) => ({
        ...prev,
        style: filtered.some((s) => s._id === prev.style?._id) ? prev.style : "",
      }));
    }
  }, [formData.brand, styles]);
  
  

  // Auto-fill style number when style is selected
    // useEffect(() => {
    //   if (formData.style) {
    //     const selectedStyle = styles.find((s) => s._id === formData.style?._id);
    //     setFormData((prev) => ({
    //       ...prev,
    //       styleNo: selectedStyle ? selectedStyle.styleNo : "", // Auto-fill style number
    //     }));
    //   }
    // }, [formData.style, styles]);

    useEffect(() => {
      if (formData.style) {
        const selectedStyle = styles.find((s) => s._id === formData.style?._id);
    
        if (selectedStyle) {
          setFormData((prev) => ({
            ...prev,
            styleNo: selectedStyle.styleNo || "", // Auto-fill or clear style number
          }));
        } else {
          // If style is not found, clear the styleNo
          setFormData((prev) => ({
            ...prev,
            styleNo: "",
          }));
        }
      } else {
        // If no style is selected, clear the styleNo
        setFormData((prev) => ({
          ...prev,
          styleNo: "",
        }));
      }
    }, [formData.style, styles]);
    

    // Handle form input changes
    const handleChange = (event) => {
      const { name, value } = event.target;
      //console.log("name:", name, "value:", value);
      console.log("handleChange formData: ", formData);
      // Define a lookup map for dropdowns that store objects instead of just values
      const lookupMap = {
        customer: customers,
        style: styles,
        fabric: fabrics,
        brand: filteredBrands,
      };
    
      // Check if the field requires object lookup
      if (lookupMap[name]) {
        setFormData({
          ...formData,
          [name]: lookupMap[name]?.find(item => item._id === value) || value, // Store object
        });
      } else if (name === "orderDate" || name === "deliveryDate") {
        setFormData({
          ...formData,
          [name]: new Date(value), // Convert date string to Date object
        });
      } else {
        setFormData({
          ...formData,
          [name]: value, // Store value as usual
        });
      }
    };

  // Validation function // Validate form before submission
  const validateForm = () => {
    let newErrors = {};
    if (!formData.orderNo) newErrors.orderNo = "Order ID is required.";
    if (!formData.customer) newErrors.customer = "Please select a customer.";
    if (!formData.orderQty || formData.orderQty <= 0) newErrors.orderQty = "Quantity must be greater than zero.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      const payload = {
        ...formData,
      customer: formData.customer?._id || null,
      brand: formData.brand?._id || null,
      style: formData.style?._id || null,
      fabric: formData.fabric?._id || null,
      fabricSupplier: formData.fabricSupplier?._id || null,
      };

      if (editOrder) {
        const updatedOrder = await updateOrder(editOrder._id, payload);
        //console.log("updatedOrder: ", updatedOrder);
        updateOrderInList(updatedOrder.populatedOrder);
        toast.success("Order updated successfully");
      } else {
        const newOrder = await createOrder(payload);
        onOrderCreated(newOrder.populatedOrder);
        //console.log("newOrder ", newOrder);
        toast.success("Order created successfully");
      }
      closeModal();
    } catch (error) {
      console.error("Error creating/editing order:", error);
      toast.error(error.response?.data?.message || "An error occurred");
    }
  };


  // 🔹 4. Auto-Fill Brand When Customer is Selected
  //Issue: Users had to manually select a brand even when there was only one valid option.
  //Fix: If only one brand matches the customer, it auto-selects.
  const handleCustomerChange = (e) => {
    const selectedCustomer = customers.find(c => c._id === e.target.value);
    const customerBrands = brands.filter(b => b.customer === selectedCustomer?._id);
    
    setFormData(prevState => ({
      ...prevState,
      customer: selectedCustomer || "",
      brand: customerBrands.length === 1 ? customerBrands[0] : "", // Auto-select if only 1 brand
    }));
  };
  

return (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white w-full max-w-3xl p-6 rounded-lg shadow-xl relative animate-fadeIn sm:scale-100">
      
      {/* 🔷 Modal Header */}
      <div className="flex justify-between items-center bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-6 py-4 rounded-t-lg">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <ShoppingCart className="w-5 h-5" />
          {editOrder ? "Edit Order" : "Add New Order"}
        </h2>
        <button onClick={closeModal} className="text-2xl hover:text-gray-300 transition-all">
          <IoClose />
        </button>
      </div>

      {/* 🔷 Scrollable Form */}
      <form onSubmit={handleSubmit} className="max-h-[70vh] overflow-y-auto space-y-6 p-4">

        {/* 🔹 General Details */}
        <div className="bg-gray-50 p-4 rounded-lg shadow-sm border">
          <h3 className="text-md font-semibold text-gray-700 flex items-center gap-2 mb-3">
            <ClipboardList className="w-5 h-5 text-indigo-500" />
            General Details
          </h3>
          <div className="grid grid-cols-2 gap-4">
          <div>
              <label className="text-sm text-gray-700 font-medium">
                Customer
                </label>
              <select name="customer" value={formData.customer?._id || ""}
              //  onChange={handleChange}
               onChange={(e) => {
                const selectedCustomer = customers.find(customer => customer._id === e.target.value);
                const selectedBrand = brands.find(brand => brand?.customer === selectedCustomer?._id);
                console.log("Selected Customer: ", selectedCustomer);
                console.log("Selected Brand: ", selectedBrand);
                setFormData(prevState => ({
                  ...prevState,
                  customer: selectedCustomer || "",
                  brand: selectedBrand || "", // Update brand dynamically
                }));
              }}
              className={`select-field ${errors.customer ? "border-red-500" : ""}`}>
                <option value="" disabled>Select a Customer</option>
                {customers.map((customer) => (
                  <option key={customer._id} value={customer._id}>{customer.name}</option>
                ))}
              </select>
              {errors.customer && <p className="text-red-500 text-xs mt-1 flex items-center"><AlertCircle className="w-4 h-4 mr-1" />{errors.customer}</p>}
            </div>
            <div>
              <label className="text-sm text-gray-700 font-medium">Brand</label>
              <select name="brand" value={formData.brand?._id} className="select-field bg-gray-100" onChange={handleChange}>
              <option value="" disabled>Select a Brand</option>
              {filteredBrands.map((brand) => (
                <option key={brand._id} value={brand._id}>{brand.name}</option>
              ))}
            </select>
            </div>
            <div>
              <label className="text-sm text-gray-700 font-medium">Season</label>
              <input type="text" name="season" value={formData.season} onChange={handleChange} className="input-field" placeholder="E.g., 2 24" />
            </div>
            <div>
              <label className="text-sm text-gray-700 font-medium">Order No.</label>
              <input type="text" name="orderNo" value={formData.orderNo} onChange={handleChange} 
              className={`input-field ${errors.orderNo ? "border-red-500" : ""}`} placeholder="E.g., 668021" />
              {errors.orderNo && <p className="text-red-500 text-xs mt-1 flex items-center"><AlertCircle className="w-4 h-4 mr-1" />{errors.orderNo}</p>}
            </div>
            <div>
              <label className="text-sm text-gray-700 font-medium">Order Quantity</label>
              <input type="number" name="orderQty" value={formData.orderQty} onChange={handleChange} min="1" step="1"
              className={`input-field ${errors.orderQty ? "border-red-500" : ""}`} placeholder="Enter quantity" />
              {errors.orderQty && <p className="text-red-500 text-xs mt-1 flex items-center"><AlertCircle className="w-4 h-4 mr-1" />{errors.orderQty}</p>}
            </div>
            <div className="flex flex-col">
              <label className="text-sm text-gray-700 font-medium">Order Date</label>
              <DatePicker selected={formData.orderDate} onChange={(date) => setFormData({ ...formData, orderDate: date })} className="input-field" />
            </div>
              {/* Select Style Dropdown */}
            <div>
              <label className="text-sm text-gray-700 font-medium">Select Style</label>
              <select name="style" value={formData.style?._id || ""} onChange={handleChange} className="select-field">
  <option value="">Select a Style</option>
  {filteredStyles.map((style) => (
    <option key={style._id} value={style._id}>{style.name}</option>
  ))}
</select>

            </div>
            <div>
              <label className="text-sm text-gray-700 font-medium">Style No.</label>
              <input type="text" name="styleNo" value={formData.styleNo} onChange={handleChange} className="input-field" placeholder="E.g., 87600" />
            </div>
            <div>
              <label className="text-sm text-gray-700 font-medium">Key No.</label>
              <input type="text" name="keyNo" value={formData.keyNo} onChange={handleChange} className="input-field" placeholder="E.g., 87600" />
            </div>
            <div>
              <label className="text-sm text-gray-700 font-medium">Article Number</label>
              <input type="text" name="articleNo" value={formData.articleNo} onChange={handleChange} className="input-field" placeholder="E.g., 80-0070/24" />
            </div>
            
          </div>
        </div>

        {/* 🔹 Fabric Selection */}
        <div className="bg-gray-50 p-4 rounded-lg shadow-sm border">
          <h3 className="text-md font-semibold text-gray-700 flex items-center gap-2 mb-3">
            <ClipboardList className="w-5 h-5 text-indigo-500" />
            Fabric
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-700 font-medium">Select Fabric</label>
              <select name="fabric" value={formData.fabric?._id || ""}
               onChange={(e) => {
                const selectedFabric = fabrics.find(fabric => fabric._id === e.target.value);
                const selectedSupplier = fabricSuppliers.find(supplier => supplier._id === selectedFabric?.supplier?._id);
                //console.log("Selected Fabric: ", selectedFabric);
                //console.log("Selected Supplier: ", selectedSupplier);
                setFormData(prevState => ({
                  ...prevState,
                  fabric: selectedFabric || "",
                  fabricSupplier: selectedSupplier || "", // Update supplier dynamically
                }));
              }}
               className="select-field">
                <option value="" disabled>Select a Fabric</option>
                {fabrics.map((fabric) => (
                  <option key={fabric._id} value={fabric._id}>{fabric.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm text-gray-700 font-medium">Fabric Supplier</label>
              <select name="fabricSupplier" value={formData.fabricSupplier?._id || ""} className="select-field bg-gray-100 cursor-not-allowed" disabled>
                <option value="">Select a Supplier</option>
                {fabricSuppliers.map((supplier) => (
                  <option key={supplier._id} value={supplier._id}>{supplier.name}</option>
                ))}
              </select>
            </div>           
          </div>
        </div>

        {/* 🔹 Order Details */}
        {/* <div className="bg-gray-50 p-4 rounded-lg shadow-sm border">
          <h3 className="text-md font-semibold text-gray-700 flex items-center gap-2 mb-3">
            <Users className="w-5 h-5 text-indigo-500" />
            Order Details
          </h3>
          <div className="grid grid-cols-2 gap-4">
            
            
            <div className="flex flex-col">
              <label className="text-sm text-gray-700 font-medium">Delivery Date</label>
              <DatePicker selected={formData.deliveryDate} onChange={(date) => setFormData({ ...formData, deliveryDate: date })} className="input-field" />
            </div>
            
          </div>
        </div> */}
          <div className="grid grid-cols-2 gap-4 mt-4">TIGER</div>

      {/* 🔷 Floating Footer */}
      <div className="absolute inset-x-0 bottom-0 bg-gray-100 px-6 py-4 flex justify-between items-center rounded-b-lg shadow-md">
        <button onClick={closeModal} className="bg-gray-400 hover:bg-gray-500 text-white px-6 py-2 rounded-lg">
          Cancel
        </button>
        <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg">
          {editOrder ? "Update Order" : "Save Order"}
        </button>
      </div>
      </form>
    </div>
  </div>
);

};

export default OrderModal;
