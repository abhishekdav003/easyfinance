

import { useState } from "react";
import { registerClient } from "../../services/api";

const AddClientForm = ({ onClientAdded }) => {
    const [formData, setFormData] = useState({
      clientName: "",
      clientPhone: "",
      clientAddress: "",
      clientpic: null,
      loans: [
        {
          loanAmount: "",
          interestRate: "",
          tenureDays: "",
          tenureMonths: "",
          emiType: "Daily",
          startDate: new Date().toISOString().slice(0, 10),
        },
      ],
    });
  
    const [isSubmitting, setIsSubmitting] = useState(false);
  
    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    };
  
    const handlePicChange = (e) => {
      setFormData(prev => ({
        ...prev,
        clientpic: e.target.files[0],
      }));
    };
  
    const handleLoanChange = (index, field, value) => {
      const updatedLoans = [...formData.loans];
      updatedLoans[index][field] = value;
      setFormData(prev => ({
        ...prev,
        loans: updatedLoans,
      }));
    };
  
    const handleAddLoan = () => {
      setFormData(prev => ({
        ...prev,
        loans: [
          ...prev.loans,
          {
            loanAmount: "",
            interestRate: "",
            tenureDays: "",
            tenureMonths: "",
            emiType: "Daily",
            startDate: new Date().toISOString().slice(0, 10),
          },
        ],
      }));
    };
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      setIsSubmitting(true);
  
      try {
        const formToSend = new FormData();
        formToSend.append("clientName", formData.clientName);
        formToSend.append("clientPhone", formData.clientPhone);
        formToSend.append("clientAddress", formData.clientAddress);
        formToSend.append("loans", JSON.stringify(formData.loans));
        if (formData.clientpic) formToSend.append("file", formData.clientpic);
  
        await registerClient(formData);
  
        alert("Client added successfully!");
  
        setFormData({
          clientName: "",
          clientPhone: "",
          clientAddress: "",
          clientpic: null,
          loans: [
            {
              loanAmount: "",
              interestRate: "",
              tenureDays: "",
              tenureMonths: "",
              emiType: "Daily",
              startDate: new Date().toISOString().slice(0, 10),
            },
          ],
        });
  
        if (onClientAdded) onClientAdded();
      } catch (err) {
        console.error("Error adding client:", err.response?.data || err.message);
        alert(`Failed to add client: ${err.response?.data?.message || err.message}`);
      } finally {
        setIsSubmitting(false);
      }
    };
  
    return (
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <input
          name="clientName"
          value={formData.clientName}
          onChange={handleChange}
          placeholder="Name"
          required
        />
        <input
          name="clientPhone"
          value={formData.clientPhone}
          onChange={handleChange}
          placeholder="Phone"
          required
        />
        <input
          name="clientAddress"
          value={formData.clientAddress}
          onChange={handleChange}
          placeholder="Address"
          required
        />
        <input
          type="file"
          onChange={handlePicChange}
          accept="image/*"
        />
  
        {formData.loans.map((loan, i) => (
          <div key={i}>
            <input
              value={loan.loanAmount}
              onChange={(e) => handleLoanChange(i, "loanAmount", e.target.value)}
              placeholder="Loan Amount"
              required
            />
            <input
              value={loan.interestRate}
              onChange={(e) => handleLoanChange(i, "interestRate", e.target.value)}
              placeholder="Interest Rate"
              required
            />
            <input
              value={loan.tenureDays}
              onChange={(e) => handleLoanChange(i, "tenureDays", e.target.value)}
              placeholder="Tenure Days"
            />
            <input
              value={loan.tenureMonths}
              onChange={(e) => handleLoanChange(i, "tenureMonths", e.target.value)}
              placeholder="Tenure Months"
            />
            <select
              value={loan.emiType}
              onChange={(e) => handleLoanChange(i, "emiType", e.target.value)}
            >
              <option value="Daily">Daily</option>
              <option value="Monthly">Monthly</option>
            </select>
            <input
              type="date"
              value={loan.startDate}
              onChange={(e) => handleLoanChange(i, "startDate", e.target.value)}
            />
          </div>
        ))}
  
        <button type="button" onClick={handleAddLoan}>Add Another Loan</button>
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit"}
        </button>
      </form>
    );
  };
  


  export default AddClientForm