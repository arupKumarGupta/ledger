import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  IconButton,
  Box,
  Button,
  Collapse,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Delete as DeleteIcon,
  Event as EventIcon,
  Add as AddIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import { EventWithStats, ExpenseWithStats } from '../types';
import ExpensesList from './ExpensesList';

interface EventsListProps {
  events: EventWithStats[];
  expensesByEvent: Map<string, ExpenseWithStats[]>;
  onViewHistory: (expenseHeadId: string) => void;
  onDeleteExpense: (expenseHeadId: string) => void;
  onDeleteEvent: (eventId: string) => void;
  onAddExpenseHead: (eventId: string) => void;
  onUpdateExpenseHead: (expenseHeadId: string, newTotalAmount: number) => void;
}

const EventsList: React.FC<EventsListProps> = ({
  events,
  expensesByEvent,
  onViewHistory,
  onDeleteExpense,
  onDeleteEvent,
  onAddExpenseHead,
  onUpdateExpenseHead,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<EventWithStats | null>(null);

  const handleDeleteClick = (event: EventWithStats) => {
    setEventToDelete(event);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (eventToDelete) {
      onDeleteEvent(eventToDelete.id);
    }
    setDeleteConfirmOpen(false);
    setEventToDelete(null);
  };

  const handleCancelDelete = () => {
    setDeleteConfirmOpen(false);
    setEventToDelete(null);
  };

  const formatDateRange = (startDate: string, endDate?: string) => {
    const start = new Date(startDate).toLocaleDateString();
    if (endDate) {
      const end = new Date(endDate).toLocaleDateString();
      return `${start} - ${end}`;
    }
    return start;
  };

  if (events.length === 0) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '300px',
          textAlign: 'center',
        }}
      >
        <Typography variant="h6" color="text.secondary">
          No events created yet. Create an event to get started!
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {events.map((event) => {
          const eventExpenses = expensesByEvent.get(event.id) || [];
          const hasExpenses = eventExpenses.length > 0;

          return (
            <Accordion
              key={event.id}
              defaultExpanded={events.length === 1}
              sx={{
                boxShadow: 3,
                '&:before': { display: 'none' },
                borderRadius: 2,
                overflow: 'hidden',
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                sx={{
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  '&:hover': {
                    bgcolor: 'primary.dark',
                  },
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: isMobile ? 'column' : 'row',
                    justifyContent: 'space-between',
                    alignItems: isMobile ? 'flex-start' : 'center',
                    width: '100%',
                    pr: isMobile ? 0 : 2,
                    gap: isMobile ? 1 : 0,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: isMobile ? 1 : 2, flex: 1, width: '100%' }}>
                    <EventIcon sx={{ fontSize: isMobile ? 20 : 24 }} />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant={isMobile ? 'subtitle1' : 'h6'} component="div" sx={{ wordBreak: 'break-word' }}>
                        {event.name}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5, flexWrap: 'wrap' }}>
                        <Chip
                          icon={<CalendarIcon />}
                          label={formatDateRange(event.startDate, event.endDate)}
                          size="small"
                          sx={{
                            bgcolor: 'rgba(255,255,255,0.2)',
                            color: 'inherit',
                            fontSize: isMobile ? '0.7rem' : '0.8rem',
                            height: isMobile ? 20 : 24,
                          }}
                        />
                        <Chip
                          label={`${event.totalExpenseHeads} Expense${event.totalExpenseHeads !== 1 ? 's' : ''}`}
                          size="small"
                          sx={{
                            bgcolor: 'rgba(255,255,255,0.2)',
                            color: 'inherit',
                            fontSize: isMobile ? '0.7rem' : '0.8rem',
                            height: isMobile ? 20 : 24,
                          }}
                        />
                      </Box>
                    </Box>
                    {isMobile && (
                      <IconButton
                        component="div"
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(event);
                        }}
                        sx={{ color: 'inherit', p: 0.5, cursor: 'pointer' }}
                        title="Delete event"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Box>

                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: isMobile ? 'row' : 'column', 
                    alignItems: isMobile ? 'center' : 'flex-end',
                    gap: isMobile ? 2 : 0,
                    justifyContent: isMobile ? 'space-between' : 'flex-start',
                    width: isMobile ? '100%' : 'auto',
                    pl: isMobile ? 4 : 0,
                  }}>
                    <Typography variant="body2" sx={{ opacity: 0.9, fontSize: isMobile ? '0.75rem' : '0.875rem' }}>
                      Budget: ₹{event.totalBudget.toLocaleString()}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9, fontSize: isMobile ? '0.75rem' : '0.875rem' }}>
                      Spent: ₹{event.totalSpent.toLocaleString()}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: isMobile ? '0.75rem' : '0.875rem' }}>
                      Due: ₹{event.totalDue.toLocaleString()}
                    </Typography>
                  </Box>

                  {!isMobile && (
                    <IconButton
                      component="div"
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClick(event);
                      }}
                      sx={{ ml: 2, color: 'inherit', cursor: 'pointer' }}
                      title="Delete event"
                    >
                      <DeleteIcon />
                    </IconButton>
                  )}
                </Box>
              </AccordionSummary>

              <AccordionDetails sx={{ p: 3 }}>
                {event.description && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {event.description}
                  </Typography>
                )}

                {hasExpenses ? (
                  <ExpensesList
                    expenses={eventExpenses}
                    onViewHistory={onViewHistory}
                    onDeleteExpense={onDeleteExpense}
                    onUpdateExpenseHead={onUpdateExpenseHead}
                  />
                ) : (
                  <Box
                    sx={{
                      textAlign: 'center',
                      py: 4,
                      px: 2,
                      bgcolor: 'action.hover',
                      borderRadius: 2,
                    }}
                  >
                    <Typography variant="body1" color="text.secondary" gutterBottom>
                      No expense heads for this event yet
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={() => onAddExpenseHead(event.id)}
                      sx={{ mt: 2 }}
                    >
                      Add Expense Head
                    </Button>
                  </Box>
                )}

                {hasExpenses && (
                  <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
                    <Button
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={() => onAddExpenseHead(event.id)}
                    >
                      Add Expense Head
                    </Button>
                  </Box>
                )}
              </AccordionDetails>
            </Accordion>
          );
        })}
      </Box>

      {/* Delete confirmation dialog */}
      <Dialog open={deleteConfirmOpen} onClose={handleCancelDelete}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the event "{eventToDelete?.name}"?
            This will also delete all associated expense heads and payment entries.
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default EventsList;

