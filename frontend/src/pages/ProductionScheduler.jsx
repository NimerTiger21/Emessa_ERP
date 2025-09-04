import React, { useState, useEffect } from "react";

const ordersMock = [
  {
    orderNo: "ORD-001",
    model: "Classic Trouser",
    style: "STYLE.SHAKIRA",
    quantity: 1800,
    assignedLine: "Line 1",
    milestones: {
      preparation: "2024-09-07",
      cutting: "2024-09-23",
      sewing: "2024-09-27",
      laundry: "2024-10-16",
      packing: "2024-10-19",
      inspection: "2024-10-24",
      delivery: "2024-11-05",
    },
  },
  {
    orderNo: "ORD-002",
    model: "Casual Shirt",
    style: "STYLE.JEAN",
    quantity: 1200,
    assignedLine: "Line 1",
    milestones: {
      preparation: "2024-09-15",
      cutting: "2024-09-28",
      sewing: "2024-10-03",
      laundry: "2024-10-20",
      packing: "2024-10-22",
      inspection: "2024-10-25",
      delivery: "2024-11-10",
    },
  },
  // Add more orders for other lines as needed
];

const lines = [
  "Line 1",
  "Line 2",
  "Line 3",
  "Line 4",
  "Line 5",
  "Line 6",
  "Line 7",
];

// Helper to add days to a date string
const addDays = (dateStr, days) => {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
};

export default function ProductionScheduler() {
  const [selectedLine, setSelectedLine] = useState(lines[0]);
  const [ordersOnLine, setOrdersOnLine] = useState([]);
  const [originalMilestones, setOriginalMilestones] = useState({});

  useEffect(() => {
    const filteredOrders = ordersMock.filter(
      (order) => order.assignedLine === selectedLine
    );
    setOrdersOnLine(filteredOrders);

    const origs = {};
    filteredOrders.forEach((o) => {
      origs[o.orderNo] = { ...o.milestones };
    });
    setOriginalMilestones(origs);
  }, [selectedLine]);

  const handleMilestoneChange = (orderNo, milestoneKey, newDate) => {
    const milestoneKeys = [
      "preparation",
      "cutting",
      "sewing",
      "laundry",
      "packing",
      "inspection",
      "delivery",
    ];
    const idx = milestoneKeys.indexOf(milestoneKey);
    if (idx === -1) return;

    const origDateStr = originalMilestones[orderNo]?.[milestoneKey];
    if (!origDateStr) return;

    const origDate = new Date(origDateStr);
    const newDateObj = new Date(newDate);
    const diffDays = Math.round((newDateObj - origDate) / (1000 * 60 * 60 * 24));

    const updatedOrders = ordersOnLine.map((order) => {
      if (order.orderNo === orderNo) {
        const newMilestones = { ...order.milestones };
        milestoneKeys.slice(idx).forEach((key) => {
          newMilestones[key] = addDays(originalMilestones[orderNo][key], diffDays);
        });
        return { ...order, milestones: newMilestones };
      } else {
        const newMilestones = { ...order.milestones };
        const changedOrderMilestoneDate = addDays(
          originalMilestones[orderNo][milestoneKey],
          diffDays
        );
        const otherOrderStartDate = new Date(order.milestones.preparation);

        if (otherOrderStartDate <= new Date(changedOrderMilestoneDate)) {
          milestoneKeys.forEach((key) => {
            newMilestones[key] = addDays(originalMilestones[order.orderNo][key], diffDays);
          });
          return { ...order, milestones: newMilestones };
        }
        return order;
      }
    });
    setOrdersOnLine(updatedOrders);
  };

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white rounded shadow space-y-6">
      <div>
        <label className="block font-semibold mb-1">Select Production Line</label>
        <select
          className="border rounded p-2 w-full"
          value={selectedLine}
          onChange={(e) => setSelectedLine(e.target.value)}
        >
          {lines.map((line) => (
            <option key={line} value={line}>
              {line}
            </option>
          ))}
        </select>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4">Orders Assigned to {selectedLine}</h2>
        {ordersOnLine.length === 0 && <p>No orders assigned to this line.</p>}
        {ordersOnLine.map((order) => (
          <div
            key={order.orderNo}
            className="border rounded p-4 mb-6 bg-gray-50 space-y-3"
          >
            <div className="flex justify-between">
              <div>
                <p><strong>Order No:</strong> {order.orderNo}</p>
                <p><strong>Model:</strong> {order.model}</p>
                <p><strong>Style:</strong> {order.style}</p>
                <p><strong>Quantity:</strong> {order.quantity}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-4">
              {Object.entries(order.milestones).map(([key, date]) => (
                <div key={key} className="flex flex-col">
                  <label className="capitalize mb-1">{key}</label>
                  <input
                    type="date"
                    className="border rounded p-1"
                    value={date}
                    onChange={(e) =>
                      handleMilestoneChange(order.orderNo, key, e.target.value)
                    }
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
