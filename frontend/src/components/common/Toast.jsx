import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Slide from '@mui/material/Slide';

function SlideTransition(props) {
  return <Slide {...props} direction="left" />;
}

export default function Toast({ open, message, severity = "error", onClose }) {
  return (
    <Snackbar
      open={open}
      autoHideDuration={6000}
      onClose={onClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      TransitionComponent={SlideTransition}
    >
      <Alert
        onClose={onClose}
        severity={severity}
        variant="filled"
        sx={{ 
          width: '100%',
          minWidth: '300px',
          fontSize: '0.95rem',
          fontWeight: 500,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
}

