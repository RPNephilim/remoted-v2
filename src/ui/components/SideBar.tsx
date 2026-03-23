import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LinkIcon from '@mui/icons-material/Link';
import InfoIcon from '@mui/icons-material/Info';
import './css/SideBar.css'
import { List, ListItemButton } from '@mui/material';

function SideBar(props: any) {
    const iconContainerStyle = {
        width: '60%',
        height: '60%',
        cursor: 'pointer',
        margin: '0 auto',
    };
    const listItemStyle = {
        '&:hover': {
            backgroundColor: 'rgb(160, 160, 160)',
            '& .MuiSvgIcon-root': { color: '#000000' }
        },
        '&.Mui-selected': {
            backgroundColor: '#ffffff !important', // Forced white background
            '& .MuiSvgIcon-root': { color: '#000000' }, // Keep icon black
        },
        // 3. Selected + Hover (Prevents flickering on hover while selected)
        '&.Mui-selected:hover': {
            backgroundColor: '#f0f0f0',
        }
    }

    return (
        <>
            <div className="sidebar-div">
                {/* Group 1: Pushed to the top */}
                <div className="sidebar-top-icons">
                    <List>
                        <ListItemButton
                            onClick={() => props.setViewport('connect')}
                            selected={props.viewport === 'connect'}
                            sx={listItemStyle}
                        >
                            <LinkIcon sx={iconContainerStyle} />
                        </ListItemButton>

                        <ListItemButton
                            onClick={() => props.setViewport('info')}
                            selected={props.viewport === 'info'}
                            sx={listItemStyle}
                        >
                            <InfoIcon sx={{ ...iconContainerStyle }} />
                        </ListItemButton>
                    </List>


                </div>

                {/* Group 2: Pushed to the bottom */}
                <div className="sidebar-bottom-icons">
                    <List>
                        <ListItemButton
                            onClick={() => props.setViewport('account')}
                            selected={props.viewport === 'account'}
                            sx={listItemStyle}
                        >
                            <AccountCircleIcon sx={{ ...iconContainerStyle }} />
                        </ListItemButton>
                    </List>
                </div>
            </div>

        </>
    )
}

export default SideBar;