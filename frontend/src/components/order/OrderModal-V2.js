import React, { useEffect, useState } from "react";
import { updateOrder, createOrder } from "../../services/orderService";
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
} from "../../services/masterDataService";
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
    orderDate: new Date(),
    deliveryDate: new Date(),
    style: null,
    styleNo: "",
    keyNo: "",
    articleNo: "",
    fabricSupplier: null,
    fabric: null,
  });

  const [customers, setCustomers] = useState([]);
  const [brands, setBrands] = useState([]);
  const [filteredBrands, setFilteredBrands] = useState([]);
  const [filteredStyles, setFilteredStyles] = useState([]);
  const [availableStyleNumbers, setAvailableStyleNumbers] = useState([]);
  const [styles, setStyles] = useState([]);
  const [fabricSuppliers, setFabricSuppliers] = useState([]);
  const [fabrics, setFabrics] = useState([]);
  const [errors, setErrors] = useState({});

  // Load master data on component mount
  useEffect(() => {
    const loadMasterData = async () => {
      try {
        const [
          stylesData,
          customersData,
          suppliersData,
          fabricsData,
          brandsData,
        ] = await Promise.all([
          fetchStyles(),
          fetchCustomers(),
          fetchFabricSuppliers(),
          fetchFabrics({
            page: 1,
            limit: 1000,
            sortField: "name",
            sortOrder: "desc",
            search: "",
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
  // useEffect(() => {
  //   if (
  //     editOrder &&
  //     customers.length &&
  //     brands.length &&
  //     styles.length &&
  //     fabrics.length &&
  //     fabricSuppliers.length
  //   ) {
  //     console.log("editOrder: ", editOrder);
  //     const mappedEditOrder = {
  //       ...editOrder,
  //       customer:
  //         customers.find((c) => c._id === editOrder.customer?._id) || null,
  //       brand: brands.find((b) => b._id === editOrder.brand?._id) || null,
  //       style: styles.find((s) => s._id === editOrder.style?._id) || null,
  //       fabric: fabrics.find((f) => f._id === editOrder.fabric?._id) || null,
  //       fabricSupplier:
  //         fabricSuppliers.find(
  //           (fs) => fs._id === editOrder.fabricSupplier?._id
  //         ) || null,
  //       orderDate: new Date(editOrder.orderDate),
  //       // deliveryDate: new Date(editOrder.deliveryDate),
  //     };

  //     // Set available style numbers when editing
  //     const selectedStyle = styles.find((s) => s._id === editOrder.style?._id);
  //     if (selectedStyle && Array.isArray(selectedStyle.styleNo)) {
  //       setAvailableStyleNumbers(selectedStyle.styleNo);
  //     }

  //     setFormData(mappedEditOrder);
  //     console.log("formData", formData);
  //   }
  // }, [editOrder, customers, brands, styles, fabrics, fabricSuppliers]);

  useEffect(() => {
    if (
      editOrder &&
      customers.length &&
      brands.length &&
      styles.length &&
      fabrics.length &&
      fabricSuppliers.length
    ) {
      // Find all related objects
      const selectedCustomer = customers.find(
        (c) => c._id === editOrder.customer?._id
      );
      const selectedBrand = brands.find((b) => b._id === editOrder.brand?._id);
      const selectedStyle = styles.find((s) => s._id === editOrder.style?._id);
      const selectedFabric = fabrics.find(
        (f) => f._id === editOrder.fabric?._id
      );
      const selectedFabricSupplier = fabricSuppliers.find(
        (fs) => fs._id === editOrder.fabricSupplier?._id
      );

      // Get available style numbers
      const styleNumbers = selectedStyle?.styleNo || [];
      setAvailableStyleNumbers(styleNumbers);

      // Prepare the form data
      const mappedEditOrder = {
        ...editOrder,
        customer: selectedCustomer || null,
        brand: selectedBrand || null,
        style: selectedStyle || null,
        fabric: selectedFabric || null,
        fabricSupplier: selectedFabricSupplier || null,
        orderDate: editOrder.orderDate ? new Date(editOrder.orderDate) : null,
        deliveryDate: editOrder.deliveryDate
          ? new Date(editOrder.deliveryDate)
          : null,
        styleNo:
          editOrder.styleNo ||
          (styleNumbers.includes(editOrder.styleNo)
            ? editOrder.styleNo
            : styleNumbers[0] || ""), // Default to first available style number if not set
      };

      setFormData(mappedEditOrder);
      console.log("Initialized formData for editing:", mappedEditOrder);
      console.log("Available style numbers:", styleNumbers);
      console.log("Selected customer:", selectedCustomer);
      console.log("selectedStyle:", selectedStyle);
      console.log("selectedStyle ID:", selectedStyle._id);
    }
  }, [editOrder, customers, brands, styles, fabrics, fabricSuppliers]);

  // Filter brands based on selected customer
  useEffect(() => {
    if (formData.customer) {
      const filtered = brands.filter(
        (b) => b.customer === formData.customer?._id
      );
      setFilteredBrands(filtered);

      // Keep brand if it's still valid, otherwise reset it
      setFormData((prev) => ({
        ...prev,
        brand: filtered.some((b) => b._id === prev.brand?._id)
          ? prev.brand
          : null,
      }));
    } else {
      setFilteredBrands([]);
      setFormData((prev) => ({
        ...prev,
        brand: null,
      }));
    }
  }, [formData.customer, brands]);

  // Filter styles based on selected brand
  useEffect(() => {
    if (formData.brand) {
      const filtered = styles.filter(
        (s) => s.brand?._id === formData.brand?._id
      );
      setFilteredStyles(filtered);

      // Clear style if it's not under the selected brand
      setFormData((prev) => ({
        ...prev,
        style: filtered.some((s) => s._id === prev.style?._id)
          ? prev.style
          : null,
        styleNo: "", // Clear style number when brand changes
      }));

      // Clear available style numbers when brand changes
      setAvailableStyleNumbers([]);
    } else {
      setFilteredStyles([]);
      setAvailableStyleNumbers([]);
      setFormData((prev) => ({
        ...prev,
        style: null,
        styleNo: "",
      }));
    }
  }, [formData.brand, styles]);

  // Update available style numbers when style is selected
  useEffect(() => {
    if (formData.style) {
      const selectedStyle = styles.find((s) => s._id === formData.style?._id);

      if (selectedStyle && Array.isArray(selectedStyle.styleNo)) {
        setAvailableStyleNumbers(selectedStyle.styleNo);

        // If not editing or styleNo doesn't exist in available numbers, clear it
        if (!editOrder || !selectedStyle.styleNo.includes(formData.styleNo)) {
          setFormData((prev) => ({
            ...prev,
            styleNo: "",
          }));
        }
      } else {
        setAvailableStyleNumbers([]);
        setFormData((prev) => ({
          ...prev,
          styleNo: "",
        }));
      }
    } else {
      // If no style is selected, clear style numbers
      setAvailableStyleNumbers([]);
      setFormData((prev) => ({
        ...prev,
        styleNo: "",
      }));
    }
  }, [formData.style, styles]);

  // Handle form input changes
  const handleChange = (event) => {
    const { name, value } = event.target;

    const lookupMap = {
      customer: customers,
      style: filteredStyles,
      fabric: fabrics,
      brand: filteredBrands,
    };

    if (lookupMap[name]) {
      const selectedItem = lookupMap[name]?.find((item) => item._id === value);

      setFormData((prev) => ({
        ...prev,
        [name]: selectedItem || value, // fallback to raw value for robustness
        // [name]: selectedItem || null,
      }));
    } else if (name === "orderDate" || name === "deliveryDate") {
      setFormData((prev) => ({
        ...prev,
        [name]: new Date(value),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Handle customer change with auto-brand selection
  const handleCustomerChange = (e) => {
    const selectedCustomer = customers.find((c) => c._id === e.target.value);
    const customerBrands = brands.filter(
      (b) => b.customer === selectedCustomer?._id
    );

    setFormData((prevState) => ({
      ...prevState,
      customer: selectedCustomer || null,
      brand: customerBrands.length === 1 ? customerBrands[0] : null, // Auto-select if only 1 brand
      style: null, // Reset style when customer changes
      styleNo: "", // Reset style number
    }));
  };

  // Handle fabric change with auto-supplier selection
  const handleFabricChange = (e) => {
    const selectedFabric = fabrics.find(
      (fabric) => fabric._id === e.target.value
    );
    const selectedSupplier = fabricSuppliers.find(
      (supplier) => supplier._id === selectedFabric?.supplier?._id
    );

    setFormData((prevState) => ({
      ...prevState,
      fabric: selectedFabric || null,
      fabricSupplier: selectedSupplier || null, // Update supplier dynamically
    }));
  };

  // Validation function
  const validateForm = () => {
    let newErrors = {};
    if (!formData.orderNo) newErrors.orderNo = "Order ID is required.";
    if (!formData.customer) newErrors.customer = "Please select a customer.";
    if (!formData.orderQty || formData.orderQty <= 0)
      newErrors.orderQty = "Quantity must be greater than zero.";
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
        updateOrderInList(updatedOrder.populatedOrder);
        toast.success("Order updated successfully");
      } else {
        const newOrder = await createOrder(payload);
        onOrderCreated(newOrder.populatedOrder);
        toast.success("Order created successfully");
      }
      closeModal();
    } catch (error) {
      console.error("Error creating/editing order:", error);
      toast.error(error.response?.data?.message || "An error occurred");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-4xl p-6 rounded-lg shadow-xl relative animate-fadeIn sm:scale-100 max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="flex justify-between items-center bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-6 py-4 rounded-t-lg">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            {editOrder ? "Edit Order" : "Add New Order"}
          </h2>
          <button
            onClick={closeModal}
            className="text-2xl hover:text-gray-300 transition-all"
          >
            <IoClose />
          </button>
        </div>

        {/* Scrollable Form */}
        <form
          onSubmit={handleSubmit}
          className="max-h-[calc(90vh-140px)] overflow-y-auto space-y-6 p-4"
        >
          {/* General Details */}
          <div className="bg-gray-50 p-4 rounded-lg shadow-sm border">
            <h3 className="text-md font-semibold text-gray-700 flex items-center gap-2 mb-3">
              <ClipboardList className="w-5 h-5 text-indigo-500" />
              General Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-700 font-medium block mb-1">
                  Customer *
                </label>
                <select
                  name="customer"
                  value={formData.customer?._id || ""}
                  onChange={handleCustomerChange}
                  className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors.customer ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="">Select a Customer</option>
                  {customers.map((customer) => (
                    <option key={customer._id} value={customer._id}>
                      {customer.name}
                    </option>
                  ))}
                </select>
                {errors.customer && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.customer}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm text-gray-700 font-medium block mb-1">
                  Brand
                </label>
                <select
                  name="brand"
                  value={formData.brand?._id || ""}
                  onChange={handleChange}
                  disabled={!formData.customer}
                  className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    !formData.customer
                      ? "bg-gray-100 cursor-not-allowed"
                      : "border-gray-300"
                  }`}
                >
                  <option value="">Select a Brand</option>
                  {filteredBrands.map((brand) => (
                    <option key={brand._id} value={brand._id}>
                      {brand.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm text-gray-700 font-medium block mb-1">
                  Season
                </label>
                <input
                  type="text"
                  name="season"
                  value={formData.season}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="E.g., 2024"
                />
              </div>

              <div>
                <label className="text-sm text-gray-700 font-medium block mb-1">
                  Order No. *
                </label>
                <input
                  type="text"
                  name="orderNo"
                  value={formData.orderNo}
                  onChange={handleChange}
                  className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors.orderNo ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="E.g., 668021"
                />
                {errors.orderNo && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.orderNo}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm text-gray-700 font-medium block mb-1">
                  Order Quantity *
                </label>
                <input
                  type="number"
                  name="orderQty"
                  value={formData.orderQty}
                  onChange={handleChange}
                  min="1"
                  step="1"
                  className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors.orderQty ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Enter quantity"
                />
                {errors.orderQty && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.orderQty}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm text-gray-700 font-medium block mb-1">
                  Order Date
                </label>
                <DatePicker
                  selected={formData.orderDate}
                  onChange={(date) =>
                    setFormData({ ...formData, orderDate: date })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  dateFormat="yyyy-MM-dd"
                />
              </div>

              <div>
                <label className="text-sm text-gray-700 font-medium block mb-1">
                  Style
                </label>
                <select
                  name="style"
                  // value={formData.style?._id || ""}
                  value={formData.style?._id ?? formData.style ?? ""}
                  onChange={handleChange}
                  disabled={!formData.brand}
                  className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    !formData.brand
                      ? "bg-gray-100 cursor-not-allowed"
                      : "border-gray-300"
                  }`}
                >
                  <option value="">Select a Style</option>
                  {filteredStyles.map((style) => (
                    <option key={style._id} value={style._id}>
                      {style.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm text-gray-700 font-medium block mb-1">
                  Style No.
                </label>
                <select
                  name="styleNo"
                  value={formData.styleNo || ""}
                  onChange={handleChange}
                  disabled={
                    !formData.style || availableStyleNumbers.length === 0
                  }
                  className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    !formData.style || availableStyleNumbers.length === 0
                      ? "bg-gray-100 cursor-not-allowed"
                      : "border-gray-300"
                  }`}
                >
                  <option value="">
                    {!formData.style
                      ? "Select Style First"
                      : availableStyleNumbers.length === 0
                      ? "No Style Numbers Available"
                      : "Select Style Number"}
                  </option>
                  {availableStyleNumbers.map((styleNo, index) => (
                    <option key={index} value={styleNo}>
                      {styleNo}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm text-gray-700 font-medium block mb-1">
                  Key No.
                </label>
                <input
                  type="text"
                  name="keyNo"
                  value={formData.keyNo}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="E.g., 87600"
                />
              </div>

              <div>
                <label className="text-sm text-gray-700 font-medium block mb-1">
                  Article Number
                </label>
                <input
                  type="text"
                  name="articleNo"
                  value={formData.articleNo}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="E.g., 80-0070/24"
                />
              </div>

              <div>
                <label className="text-sm text-gray-700 font-medium block mb-1">
                  Delivery Date
                </label>
                <DatePicker
                  selected={formData.deliveryDate}
                  onChange={(date) =>
                    setFormData({ ...formData, deliveryDate: date })
                  }
                  isClearable
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  dateFormat="yyyy-MM-dd"
                />
              </div>
            </div>
          </div>

          {/* Fabric Selection */}
          <div className="bg-gray-50 p-4 rounded-lg shadow-sm border">
            <h3 className="text-md font-semibold text-gray-700 flex items-center gap-2 mb-3">
              <ClipboardList className="w-5 h-5 text-indigo-500" />
              Fabric Selection
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-700 font-medium block mb-1">
                  Fabric
                </label>
                <select
                  name="fabric"
                  value={formData.fabric?._id || ""}
                  onChange={handleFabricChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select a Fabric</option>
                  {fabrics.map((fabric) => (
                    <option key={fabric._id} value={fabric._id}>
                      {fabric.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm text-gray-700 font-medium block mb-1">
                  Fabric Supplier
                </label>
                <select
                  name="fabricSupplier"
                  value={formData.fabricSupplier?._id || ""}
                  disabled
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-100 cursor-not-allowed"
                >
                  <option value="">
                    {formData.fabricSupplier?.name ||
                      "Auto-selected based on fabric"}
                  </option>
                  {fabricSuppliers.map((supplier) => (
                    <option key={supplier._id} value={supplier._id}>
                      {supplier.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex justify-between items-center bg-gray-100 px-6 py-4 rounded-b-lg">
          <button
            onClick={closeModal}
            className="bg-gray-400 hover:bg-gray-500 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            {editOrder ? "Update Order" : "Save Order"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderModal;
