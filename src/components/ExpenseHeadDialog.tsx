import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
} from '@mui/material';
import { ExpenseHead } from '../types';

interface ExpenseHeadDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (expenseHead: Omit<ExpenseHead, 'id' | 'createdAt'>) => void;
}

const ExpenseHeadDialog: React.FC<ExpenseHeadDialogProps> = ({ open, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [errors, setErrors] = useState<{ name?: string; category?: string; totalAmount?: string }>({});

  const handleClose = () => {
    setName('');
    setCategory('');
    setTotalAmount('');
    setErrors({});
    onClose();
  };

  const validate = (): boolean => {
    const newErrors: { name?: string; category?: string; totalAmount?: string } = {};
    
    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!category.trim()) {
      newErrors.category = 'Category is required';
    }
    
    const amount = parseFloat(totalAmount);
    if (!totalAmount || isNaN(amount) || amount <= 0) {
      newErrors.totalAmount = 'Please enter a valid amount greater than 0';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validate()) {
      onSave({
        name: name.trim(),
        category: category.trim(),
        totalAmount: parseFloat(totalAmount),
      });
      handleClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create Expense Head</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={!!errors.name}
            helperText={errors.name}
            fullWidth
            autoFocus
          />
          <TextField
            label="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            error={!!errors.category}
            helperText={errors.category}
            fullWidth
          />
          <TextField
            label="Total Amount"
            type="number"
            value={totalAmount}
            onChange={(e) => setTotalAmount(e.target.value)}
            error={!!errors.totalAmount}
            helperText={errors.totalAmount}
            fullWidth
            inputProps={{ step: '0.01', min: '0' }}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained" color="primary">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExpenseHeadDialog;

