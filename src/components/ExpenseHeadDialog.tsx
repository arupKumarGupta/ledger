import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  MenuItem,
  Alert,
} from '@mui/material';
import { ExpenseHead, Event } from '../types';

interface ExpenseHeadDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (expenseHead: Omit<ExpenseHead, 'id' | 'createdAt'>) => void;
  events: Event[];
  onAddEvent: () => void; // Callback to open EventDialog
  preSelectedEventId?: string; // Event to preselect if creating from an event view
}

const ExpenseHeadDialog: React.FC<ExpenseHeadDialogProps> = ({ 
  open, 
  onClose, 
  onSave, 
  events,
  onAddEvent,
  preSelectedEventId,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [eventId, setEventId] = useState('');
  const [errors, setErrors] = useState<{ name?: string; category?: string; totalAmount?: string; eventId?: string }>({});

  useEffect(() => {
    if (preSelectedEventId) {
      setEventId(preSelectedEventId);
    } else if (events.length === 1) {
      // Auto-select if only one event exists
      setEventId(events[0].id);
    }
  }, [preSelectedEventId, events, open]);

  const handleClose = () => {
    setName('');
    setCategory('');
    setTotalAmount('');
    setEventId('');
    setErrors({});
    onClose();
  };

  const validate = (): boolean => {
    const newErrors: { name?: string; category?: string; totalAmount?: string; eventId?: string } = {};
    
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

    if (!eventId) {
      newErrors.eventId = 'Please select an event';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validate()) {
      onSave({
        eventId,
        name: name.trim(),
        category: category.trim(),
        totalAmount: parseFloat(totalAmount),
      });
      handleClose();
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: {
          m: { xs: 1, sm: 2 },
          maxHeight: { xs: 'calc(100% - 16px)', sm: 'calc(100% - 64px)' },
        }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>Create Expense Head</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          {events.length === 0 && (
            <Alert severity="warning" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
              No events found! Please create an event first.
              <Button size="small" onClick={() => { handleClose(); onAddEvent(); }} sx={{ mt: 1 }}>
                Create Event
              </Button>
            </Alert>
          )}

          <TextField
            select
            label="Event"
            value={eventId}
            onChange={(e) => setEventId(e.target.value)}
            error={!!errors.eventId}
            helperText={errors.eventId || 'Select the event this expense belongs to'}
            fullWidth
            size="medium"
            disabled={events.length === 0}
          >
            {events.map((event) => (
              <MenuItem key={event.id} value={event.id}>
                {event.name} ({new Date(event.startDate).toLocaleDateString()})
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={!!errors.name}
            helperText={errors.name}
            fullWidth
            size="medium"
            placeholder="e.g., Venue, Catering, Photography"
          />
          <TextField
            label="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            error={!!errors.category}
            helperText={errors.category}
            fullWidth
            size="medium"
            placeholder="e.g., Venue, Food, Services"
          />
          <TextField
            label="Total Budget"
            type="number"
            value={totalAmount}
            onChange={(e) => setTotalAmount(e.target.value)}
            error={!!errors.totalAmount}
            helperText={errors.totalAmount}
            fullWidth
            size="medium"
            inputProps={{ step: '0.01', min: '0' }}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} size="large">Cancel</Button>
        <Button onClick={handleSave} variant="contained" color="primary" disabled={events.length === 0} size="large">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExpenseHeadDialog;

