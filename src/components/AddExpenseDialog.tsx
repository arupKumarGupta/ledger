import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Autocomplete,
  Alert,
  IconButton,
  Typography,
  Fab,
} from '@mui/material';
import { Add as AddIcon, Close as CloseIcon, CloudUpload as UploadIcon } from '@mui/icons-material';
import { ExpenseHead, ExpenseEntry } from '../types';

interface AddExpenseDialogProps {
  open: boolean;
  onClose: () => void;
  expenseHeads: ExpenseHead[];
  onSave: (entry: Omit<ExpenseEntry, 'id'>) => void;
  onAddExpenseHead: () => void;
  getAmountDue: (expenseHeadId: string) => number;
  preSelectedExpenseHeadId?: string;
}

const AddExpenseDialog: React.FC<AddExpenseDialogProps> = ({
  open,
  onClose,
  expenseHeads,
  onSave,
  onAddExpenseHead,
  getAmountDue,
  preSelectedExpenseHeadId,
}) => {
  const [selectedExpenseHead, setSelectedExpenseHead] = useState<ExpenseHead | null>(null);
  const [amountPaid, setAmountPaid] = useState('');
  const [customDate, setCustomDate] = useState('');
  const [customTime, setCustomTime] = useState('');
  const [image, setImage] = useState<string>('');
  const [imageFileName, setImageFileName] = useState<string>('');
  const [errors, setErrors] = useState<{ expenseHead?: string; amountPaid?: string }>({});
  const [warning, setWarning] = useState<string>('');

  useEffect(() => {
    if (preSelectedExpenseHeadId && expenseHeads.length > 0) {
      const preSelected = expenseHeads.find(head => head.id === preSelectedExpenseHeadId);
      if (preSelected) {
        setSelectedExpenseHead(preSelected);
      }
    }
  }, [preSelectedExpenseHeadId, expenseHeads]);

  const handleClose = () => {
    setSelectedExpenseHead(null);
    setAmountPaid('');
    setCustomDate('');
    setCustomTime('');
    setImage('');
    setImageFileName('');
    setErrors({});
    setWarning('');
    onClose();
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors({ ...errors, amountPaid: 'Image size should be less than 5MB' });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setImageFileName(file.name);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImage('');
    setImageFileName('');
  };

  const validate = (): boolean => {
    const newErrors: { expenseHead?: string; amountPaid?: string } = {};
    let newWarning = '';
    
    if (!selectedExpenseHead) {
      newErrors.expenseHead = 'Please select an expense head';
    }
    
    const amount = parseFloat(amountPaid);
    if (!amountPaid || isNaN(amount) || amount <= 0) {
      newErrors.amountPaid = 'Please enter a valid amount greater than 0';
    } else if (selectedExpenseHead) {
      const amountDue = getAmountDue(selectedExpenseHead.id);
      if (amount > amountDue) {
        newWarning = `Warning: Amount paid (₹${amount.toFixed(2)}) exceeds remaining amount (₹${amountDue.toFixed(2)})`;
      }
    }
    
    setErrors(newErrors);
    setWarning(newWarning);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validate() && selectedExpenseHead) {
      let entryDate: string;
      
      // If custom date/time is provided, use it; otherwise use current date/time
      if (customDate) {
        const timeToUse = customTime || '00:00';
        entryDate = new Date(`${customDate}T${timeToUse}`).toISOString();
      } else {
        entryDate = new Date().toISOString();
      }
      
      onSave({
        expenseHeadId: selectedExpenseHead.id,
        amountPaid: parseFloat(amountPaid),
        date: entryDate,
        image: image || undefined,
      });
      handleClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add Expense Entry</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
            <Autocomplete
              value={selectedExpenseHead}
              onChange={(_, newValue) => {
                setSelectedExpenseHead(newValue);
                setWarning('');
              }}
              options={expenseHeads}
              getOptionLabel={(option) => `${option.name} (${option.category})`}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Expense Head"
                  error={!!errors.expenseHead}
                  helperText={errors.expenseHead}
                />
              )}
              fullWidth
              autoHighlight
            />
            <IconButton
              color="primary"
              onClick={onAddExpenseHead}
              sx={{ mt: 1 }}
              title="Add new expense head"
            >
              <AddIcon />
            </IconButton>
          </Box>

          {selectedExpenseHead && (
            <Alert severity="info">
              Total Amount: ₹{selectedExpenseHead.totalAmount.toFixed(2)} | 
              Remaining: ₹{getAmountDue(selectedExpenseHead.id).toFixed(2)}
            </Alert>
          )}

          <TextField
            label="Amount Paid"
            type="number"
            value={amountPaid}
            onChange={(e) => {
              setAmountPaid(e.target.value);
              setWarning('');
            }}
            error={!!errors.amountPaid}
            helperText={errors.amountPaid}
            fullWidth
            inputProps={{ step: '0.01', min: '0' }}
          />

          {warning && <Alert severity="warning">{warning}</Alert>}

          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Date (Optional)"
              type="date"
              value={customDate}
              onChange={(e) => setCustomDate(e.target.value)}
              fullWidth
              InputLabelProps={{ shrink: true }}
              helperText="Leave empty to use current date"
            />
            <TextField
              label="Time (Optional)"
              type="time"
              value={customTime}
              onChange={(e) => setCustomTime(e.target.value)}
              fullWidth
              InputLabelProps={{ shrink: true }}
              helperText="Leave empty to use current time"
            />
          </Box>

          <Box>
            <Button
              component="label"
              variant="outlined"
              startIcon={<UploadIcon />}
              fullWidth
            >
              Upload Image (Optional)
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleImageUpload}
              />
            </Button>
            {imageFileName && (
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, gap: 1 }}>
                <Typography variant="body2" sx={{ flex: 1 }}>
                  {imageFileName}
                </Typography>
                <IconButton size="small" onClick={handleRemoveImage}>
                  <CloseIcon />
                </IconButton>
              </Box>
            )}
          </Box>
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

export default AddExpenseDialog;

