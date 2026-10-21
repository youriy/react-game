import React from 'react';
import Typography from '@mui/material/Typography';

// Крупная надпись в строке статуса (время, попытки)
export default function StatusText({children}) {
    return (
        <Typography
            variant="h4"
            gutterBottom
            component="div"
            color="primary"
            sx={{textAlign: "center", marginTop: "20px!important"}}
        >
            {children}
        </Typography>
    );
}
