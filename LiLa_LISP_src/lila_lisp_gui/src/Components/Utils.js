import {Link, Typography} from "@mui/material";


export function Copyright() {
    return (
        <Typography variant="body2" color="textSecondary" align="center">
            {'Copyright © '}
            <Link color="inherit" href="https://lila-erc.eu">
                LiLa ERC
            </Link>{' '}
            {new Date().getFullYear()}
            {''}
        </Typography>
    );
}
