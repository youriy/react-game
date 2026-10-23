import React from 'react';
import Typography from '@mui/material/Typography';

/**
 * Крупная надпись в строке статуса (время, попытки, очки). На телефоне — мельче (16 px).
 * Своих отступов нет: расстояние до кнопок и поля задаёт GameArea.
 * @param {{children: React.ReactNode}} props
 */
export default function StatusText({children}) {
    return (
        <Typography
            variant="h4"
            component="div"
            color="primary"
            sx={{
                textAlign: "center",
                fontSize: {xs: "1rem", sm: undefined},
                whiteSpace: "nowrap",
            }}
        >
            {children}
        </Typography>
    );
}
