import React, { useState } from "react";
import { Trash2 } from "lucide-react";
import { Progress } from "../components/ui/progress";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";


const FabricCompositionForm = ({ compositions, setCompositions, availableCompositions, onSave }) => {
  const [selectedComposition, setSelectedComposition] = useState("");
  const [percentage, setPercentage] = useState("");

  const totalPercentage = compositions.reduce((sum, c) => sum + c.percentage, 0);
  const isComplete = totalPercentage === 100;

  const handleAddComposition = () => {
    if (!selectedComposition || percentage <= 0 || percentage > 100) return;
    if (totalPercentage + parseFloat(percentage) > 100) return;
    
    const newComp = {
      id: selectedComposition,
      name: availableCompositions.find((c) => c.id === selectedComposition).name,
      percentage: parseFloat(percentage),
    };
    setCompositions([...compositions, newComp]);
    setSelectedComposition("");
    setPercentage("");
  };

  const handleRemoveComposition = (id) => {
    setCompositions(compositions.filter((c) => c.id !== id));
  };

  return (
    <Card className="p-4 shadow-lg rounded-xl border border-gray-300">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Fabric Composition</h3>

      <div className="flex gap-4 mb-4">
        <select
          className="border p-2 rounded w-1/2"
          value={selectedComposition}
          onChange={(e) => setSelectedComposition(e.target.value)}
        >
          <option value="">Select Composition</option>
          {availableCompositions.map((comp) => (
            <option key={comp.id} value={comp.id}>{comp.name}</option>
          ))}
        </select>

        <input
          type="number"
          className="border p-2 rounded w-1/4"
          placeholder="%"
          value={percentage}
          onChange={(e) => setPercentage(e.target.value)}
        />

        <Button onClick={handleAddComposition} disabled={totalPercentage >= 100}>Add</Button>
      </div>

      <CardContent>
        <table className="w-full border rounded-lg overflow-hidden shadow-md">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-3 border">Composition</th>
              <th className="p-3 border">Percentage</th>
              <th className="p-3 border">Action</th>
            </tr>
          </thead>
          <tbody>
            {compositions.map((comp, index) => (
              <tr key={index} className="border-b hover:bg-gray-100">
                <td className="p-3 text-center">{comp.name}</td>
                <td className="p-3 text-center">{comp.percentage}%</td>
                <td className="p-3 text-center">
                  <button
                    onClick={() => handleRemoveComposition(comp.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>

      <div className="mt-4">
        <Progress value={totalPercentage} className="h-2 bg-gray-300" />
        <p className="text-center text-sm mt-2">Total: {totalPercentage}%</p>
      </div>

      <Button className="mt-4 w-full" disabled={!isComplete} onClick={onSave}>
        Save Fabric
      </Button>
    </Card>
  );
};

export default FabricCompositionForm;
