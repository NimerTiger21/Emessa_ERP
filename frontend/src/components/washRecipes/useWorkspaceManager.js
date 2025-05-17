import { useState, useCallback, useMemo } from "react";
import { v4 as uuidv4 } from "uuid";

export const useWorkspaceManager = () => {
  const [workspaceItems, setWorkspaceItems] = useState([]);

  

  // Centralized method to add a new item (step or process)
  const addItem = useCallback((newItem, type) => {
    setWorkspaceItems((prevItems) => {
      // Create a new item with a unique ID and type
      const itemToAdd = {
        ...newItem,
        id: uuidv4(),
        type,
        sequence: prevItems.length + 1,
      };

      // Return new array with the added item
      return [...prevItems, itemToAdd];
    });
  }, []);

  // Method to remove an item by its ID
  const removeItem = useCallback((itemId) => {
    setWorkspaceItems((prevItems) => {
      // Filter out the item to remove
      const updatedItems = prevItems.filter((item) => item.id !== itemId);

      // Resequence the remaining items
      return updatedItems.map((item, index) => ({
        ...item,
        sequence: index + 1,
      }));
    });
  }, []);

  // Method to update an existing item
  const updateItem = useCallback((itemId, updatedData) => {
    //console.log("Updating item with ID:", itemId, "with data:", updatedData);
    setWorkspaceItems((prevItems) =>
      prevItems.map((item) =>
        // Only update the specific item that matches the exact ID
        item.id === itemId ? { ...item, ...updatedData } : item
      )
    );
  }, []);

  // Method to handle drag and drop reordering
  const reorderItems = useCallback((startIndex, endIndex) => {
    if (startIndex === endIndex) return;
    setWorkspaceItems((prevItems) => {
      // Create a copy of the items array
      const reorderedItems = Array.from(prevItems);

      // Remove the dragged item from its original position
      const [removed] = reorderedItems.splice(startIndex, 1);

      // Insert the item at the new position
      reorderedItems.splice(endIndex, 0, removed);

      // Ensure proper consecutive sequencing (1, 2, 3, ...) for ALL items
      // Resequence all items
      return reorderedItems.map((item, index) => ({
        ...item,
        sequence: index + 1, // Assign consecutive sequence numbers
      }));
    });
  }, []);

  // Memoized selectors for steps and processes
  const steps = useMemo(
    () =>
      workspaceItems
        .filter((item) => item.type === "step")
        .sort((a, b) => a.sequence - b.sequence),
    [workspaceItems]
  );

  const processes = useMemo(
    () =>
      workspaceItems
        .filter((item) => item.type === "process")
        .sort((a, b) => a.sequence - b.sequence),
    [workspaceItems]
  );

  // Replace all processes
  const updateProcesses = (newProcesses) => {
    console.log("Updating processes:", newProcesses);
    // Filter out existing processes
    const nonProcessItems = workspaceItems.filter(item => item.type !== "process");
    
    // Add the updated processes
    setWorkspaceItems([...nonProcessItems, ...newProcesses]);
  };

  
  return {
    workspaceItems,
    steps,
    processes,
    addItem,
    removeItem,
    updateItem,
    reorderItems,
    updateProcesses,
    setWorkspaceItems,
  };
};
