import React, { useEffect, useState } from "react";
import { IoClose } from "react-icons/io5";
import { toast } from "react-toastify";
import {
  fetchCustomers,
  fetchBrands,
  createStyle,
  updateStyle
} from "../services/masterDataService";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";

const StyleModal = ({ isOpen, closeModal, editStyle, refreshStyleList }) => {
  const [formData, setFormData] = useState({
    customer: "",
    brand: "",
    styleName: "",
    styleNo: ""
  });
  const [customers, setCustomers] = useState([]);
  const [brands, setBrands] = useState([]);
  const [filteredBrands, setFilteredBrands] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      const [cust, brd] = await Promise.all([
        fetchCustomers(),
        fetchBrands()
      ]);
      setCustomers(cust);
      setBrands(brd);
    };
    loadData();
  }, []);

  // Populate data when editing
  useEffect(() => {
    if (editStyle && customers.length && brands.length) {
      console.log("editStyle.brand?._id=> ", editStyle.brand?._id);
      console.log("brands=> ", brands);
      const brandData = brands.find(b => b._id === editStyle.brand?._id);
      const customerData = customers.find(c => c._id === brandData?.customer);
      console.log("brandData=> ", brandData);

      setFormData({
        customer: customerData?._id || "",
        brand: brandData?._id || "",
        styleName: editStyle.name || "",
        styleNo: editStyle.styleNo || ""
      });
    }
  }, [editStyle, customers, brands]);

  useEffect(() => {
    const filtered = brands.filter(
      (b) => b.customer === formData.customer
    );
    setFilteredBrands(filtered);
    if (!filtered.some(b => b._id === formData.brand)) {
      console.log("Setting brand to empty");
      //setFormData(prev => ({ ...prev, brand: "" }));
    }
  }, [formData.customer, brands]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { customer, brand, styleName, styleNo } = formData;

    if (!customer || !brand || !styleName) { //|| !styleNo
      toast.error("Please fill all required fields.");
      return;
    }

    try {
      if (editStyle) {
        await updateStyle(editStyle._id, formData);
        //toast.success("Style updated successfully.");
      } else {
        await createStyle(formData);
        //toast.success("Style created successfully.");
      }
      refreshStyleList(); // Refresh list after creation or edit
      closeModal();
    } catch (err) {
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
              <label className="block text-sm font-medium text-gray-700">Customer</label>
              <select
                name="customer"
                value={formData.customer}
                onChange={handleChange}
                className="select-field"
              >
                <option value="" disabled>Select Customer</option>
                {customers.map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Brand */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Brand</label>
              <select
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                className="select-field"
              >
                <option value="" disabled>Select Brand</option>
                {filteredBrands.map((b) => (
                  <option key={b._id} value={b._id}>{b.name}</option>
                ))}
              </select>
            </div>

            {/* Style Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Style Name</label>
              <input
                name="styleName"
                value={formData.styleName}
                onChange={handleChange}
                placeholder="e.g., Luke Slim"
                className="input-field"
              />
            </div>

            {/* Style No */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Style No.</label>
              <input
                name="styleNo"
                value={formData.styleNo}
                onChange={handleChange}
                placeholder="e.g., 87600"
                className="input-field"
              />
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="mt-4 flex justify-end gap-3 pt-4 border-t">
            <Button onClick={closeModal} className="bg-gray-400 hover:bg-gray-500 text-white">
              Cancel
            </Button>
            <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white">
              {editStyle ? "Update Style" : "Save Style"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default StyleModal;
