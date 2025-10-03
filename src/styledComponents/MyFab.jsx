import { Fab } from '@mui/material'
import React from 'react'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

export const MyFab = ({ visibleFab, screenSize }) => {
    return (
        <Fab style={{ opacity: visibleFab ? 1 : 0, transition: 'opacity 1000ms cubic-bezier(0.4, 0, 0.2, 1) 0ms', visibility: (visibleFab) ? null : 'hidden' }} aria-label="add" sx={{ position: 'fixed', bottom: 15, right: 5, backgroundColor: '#7E57C2', width: (screenSize.width > 600) ? 35 : 28, height: (screenSize.width > 600) ? 35 : 28 }} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <KeyboardArrowUpIcon fontSize='small' />
        </Fab>
    )
}
