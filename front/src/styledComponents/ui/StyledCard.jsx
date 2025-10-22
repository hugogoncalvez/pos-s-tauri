import React from 'react';
import { styled } from '@mui/material/styles';
import Card from '@mui/material/Card';

// Create the styled component first
const CustomCard = styled(Card)(({ theme }) => ({
  borderRadius: '12px',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
  backgroundColor: theme.palette.background.paper,
  padding: 'clamp(16px, 2vw, 24px)',
  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 16px rgba(0, 0, 0, 0.12)',
  },
}));

// Use forwardRef to pass the ref to the styled component
export const StyledCard = React.forwardRef((props, ref) => {
  return <CustomCard {...props} ref={ref} />;
});