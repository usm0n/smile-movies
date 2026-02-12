import { Box, Card, Link, Typography, useColorScheme } from "@mui/joy";
import MarkEmailUnreadIcon from '@mui/icons-material/MarkEmailUnread';
import { useUsers } from "../../../context/Users";
import { backdropLoading } from "../../../utilities/defaults";

function EmailSent() {
    const email = sessionStorage.getItem("forgot-password")
    const { resendForgotPasswordData, resendForgotPasswordToken } = useUsers()
    const { colorScheme } = useColorScheme()
    return (
        <>
            {backdropLoading(resendForgotPasswordData?.isLoading, colorScheme)}
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "100vh",
                }}
            >
                <Card
                    sx={{
                        padding: "20px",
                        borderRadius: "10px",
                        gap: "20px",
                    }}
                >
                    <MarkEmailUnreadIcon sx={{ fontSize: "40px", margin: "0 auto" }} />
                    <Typography sx={{ fontSize: "20px" }}>Verification link has been sent to your email <Link>{email}</Link></Typography>
                    <Link sx={{ margin: "0 auto" }} disabled={resendForgotPasswordData?.isLoading} onClick={() => resendForgotPasswordToken(email!)}>Resend verification link to your email</Link>
                    <Typography color="success" sx={{ margin: "0 auto" }}>{resendForgotPasswordData?.data && `Resent your verification link to your email`}</Typography>
                </Card>
            </Box>
        </>
    )
}

export default EmailSent