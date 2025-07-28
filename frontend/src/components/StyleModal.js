import React, { useEffect, useState } from "react";
import { IoClose } from "react-icons/io5";
import { toast } from "react-toastify";
import {
  fetchCustomers,
  fetchBrands,
  createStyle,
  updateStyle,
} from "../services/masterDataService";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";

const StyleModal = ({ isOpen, closeModal, editStyle, refreshStyleList }) => {
  const [formData, setFormData] = useState({
    customer: "",
    brand: "",
    styleName: "",
  });
  const [customers, setCustomers] = useState([]);
  const [brands, setBrands] = useState([]);
  const [filteredBrands, setFilteredBrands] = useState([]);
  
  // Separate state for managing multiple style numbers
  const [styleNumbers, setStyleNumbers] = useState([""]);

  useEffect(() => {
    const loadData = async () => {
      const [cust, brd] = await Promise.all([fetchCustomers(), fetchBrands()]);
      setCustomers(cust);
      setBrands(brd);
    };
    loadData();
  }, []);

  // Populate data when editing
  useEffect(() => {
    if (editStyle && customers.length && brands.length) {
      const brandData = brands.find((b) => b._id === editStyle.brand?._id);
      const customerData = customers.find((c) => c._id === brandData?.customer);

      setFormData({
        customer: customerData?._id || "",
        brand: brandData?._id || "",
        styleName: editStyle.name || "",
      });

      // Set style numbers from edit data
      const editStyleNumbers = Array.isArray(editStyle.styleNo) 
        ? editStyle.styleNo.filter(num => num && num.trim() !== '')
        : (editStyle.styleNo ? [editStyle.styleNo] : [""]);
      
      setStyleNumbers(editStyleNumbers.length > 0 ? editStyleNumbers : [""]);
    }
  }, [editStyle, customers, brands]);

  useEffect(() => {
    const filtered = brands.filter((b) => b.customer === formData.customer);
    setFilteredBrands(filtered);
    if (!filtered.some((b) => b._id === formData.brand)) {
      // console.log("Setting brand to empty");
      // setFormData(prev => ({ ...prev, brand: "" }));
    }
  }, [formData.customer, brands]);

  const handleStyleNoChange = (index, value) => {
    const updated = [...styleNumbers];
    updated[index] = value;
    setStyleNumbers(updated);
  };

  const addStyleNo = () => {
    setStyleNumbers(prev => [...prev, ""]);
  };

  const removeStyleNo = (index) => {
    if (styleNumbers.length > 1) {
      const updated = styleNumbers.filter((_, i) => i !== index);
      setStyleNumbers(updated);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { customer, brand, styleName } = formData;

    if (!customer || !brand || !styleName) {
      toast.error("Please fill all required fields.");
      return;
    }

    // Filter out empty style numbers
    const filteredStyleNumbers = styleNumbers.filter(num => num && num.trim() !== '');
    
    if (filteredStyleNumbers.length === 0) {
      toast.error("Please add at least one style number.");
      return;
    }

    try {
      const submitData = {
        customer,
        brand,
        styleName,
        styleNo: filteredStyleNumbers
      };

      if (editStyle) {
        await updateStyle(editStyle._id, submitData);
        // toast.success("Style updated successfully.");
      } else {
        await createStyle(submitData);
        // toast.success("Style created successfully.");
      }
      
      refreshStyleList(); // Refresh list after creation or edit
      closeModal();
      
      // Reset form
      setFormData({
        customer: "",
        brand: "",
        styleName: "",
      });
      setStyleNumbers([""]);
      
    } catch (err) {
      console.error("Error saving style:", err);
      toast.error("Failed to save style.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-xl p-6 bg-white shadow-lg rounded-lg relative">
        {/* Modal Header */}
        <div className="flex justify-between items-center bg-gradient-to-r from-indigo-500 to-blue-600 text-white px-5 py-3 rounded-t-lg">
          <h2 className="text-lg font-semibold">
            {editStyle ? "Edit Style" : "Add New Style"}
          </h2>
          <button onClick={closeModal} className="text-2xl hover:text-gray-300">
            <IoClose />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Customer */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Customer*
              </label>
              <select
                name="customer"
                value={formData.customer}
                onChange={handleChange}
                className="select-field"
                required
              >
                <option value="" disabled>
                  Select Customer
                </option>
                {customers.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Brand */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Brand*
              </label>
              <select
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                className="select-field"
                required
              >
                <option value="" disabled>
                  Select Brand
                </option>
                {filteredBrands.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Style Name */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Style Name*
              </label>
              <input
                name="styleName"
                value={formData.styleName}
                onChange={handleChange}
                placeholder="e.g., Luke Slim"
                className="input-field"
                required
              />
            </div>
          </div>

          {/* Style Numbers Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Style Numbers*
            </label>
            <div className="space-y-2">
              {styleNumbers.map((styleNo, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={styleNo}
                    onChange={(e) => handleStyleNoChange(index, e.target.value)}
                    placeholder={`Style Number ${index + 1}`}
                    className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => removeStyleNo(index)}
                    disabled={styleNumbers.length === 1}
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      styleNumbers.length === 1
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-red-500 hover:bg-red-600 text-white'
                    }`}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addStyleNo}
              className="mt-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-sm font-medium"
            >
              + Add Style Number
            </button>
          </div>

          {/* Footer Buttons */}
          <div className="mt-6 flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              onClick={closeModal}
              className="bg-gray-400 hover:bg-gray-500 text-white"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {editStyle ? "Update Style" : "Save Style"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default StyleModal;