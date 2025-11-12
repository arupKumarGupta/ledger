import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
} from '@mui/material';
import { Event } from '../types';

interface EventDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (event: Omit<Event, 'id' | 'createdAt'>) => void;
  event?: Event | null; // For editing existing events
}

const EventDialog: React.FC<EventDialogProps> = ({
  open,
  onClose,
  onSave,
  event,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    if (event) {
      setName(event.name);
      setDescription(event.description || '');
      setStartDate(event.startDate.split('T')[0]); // Convert ISO to date input format
      setEndDate(event.endDate ? event.endDate.split('T')[0] : '');
    } else {
      // Default to today's date
      setStartDate(new Date().toISOString().split('T')[0]);
      setEndDate('');
    }
  }, [event, open]);

  const handleSubmit = () => {
    if (!name.trim()) {
      alert('Please enter an event name');
      return;
    }

    if (!startDate) {
      alert('Please select a start date');
      return;
    }

    onSave({
      name: name.trim(),
      description: description.trim() || undefined,
      startDate: new Date(startDate).toISOString(),
      endDate: endDate ? new Date(endDate).toISOString() : undefined,
    });

    // Reset form
    setName('');
    setDescription('');
    setStartDate(new Date().toISOString().split('T')[0]);
    setEndDate('');
    onClose();
  };

  const handleClose = () => {
    // Reset form on close
    setName('');
    setDescription('');
    setStartDate(new Date().toISOString().split('T')[0]);
    setEndDate('');
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="sm" 
      fullWidth
      fullScreen={false}
      PaperProps={{
        sx: {
          m: { xs: 1, sm: 2 },
          maxHeight: { xs: 'calc(100% - 16px)', sm: 'calc(100% - 64px)' },
        }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>{event ? 'Edit Event' : 'Create New Event'}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            label="Event Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            required
            autoFocus
            placeholder="e.g., Birthday Party, Wedding, Office Event"
            size="medium"
          />
          
          <TextField
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            multiline
            rows={2}
            placeholder="Optional description"
            size="medium"
          />

          <TextField
            label="Start Date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            fullWidth
            required
            size="medium"
            InputLabelProps={{
              shrink: true,
            }}
          />

          <TextField
            label="End Date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            fullWidth
            size="medium"
            InputLabelProps={{
              shrink: true,
            }}
            helperText="Optional - leave blank for single-day events"
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} size="large">Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" size="large">
          {event ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EventDialog;

