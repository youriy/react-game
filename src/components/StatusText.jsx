import React from 'react';
import Typography from '@mui/material/Typography';

/**
 * Крупная надпись в строке статуса (время, попытки, очки). На телефоне — мельче и с меньшим отступом.
 * @param {{children: React.ReactNode}} props
 */
export default function StatusText({children}) {
    return (
        <Typography
            variant="h4"
            gutterBottom
            component="div"
            color="primary"
            sx={{
                textAlign: "center",
                marginTop: {xs: "4px!important", sm: "20px!important"},
                fontSize: {xs: "1.1rem", sm: undefined},
                whiteSpace: "nowrap",
            }}
        >
            {children}
        </Typography>
    );
}
