import { useNavigate, useParams } from "react-router-dom"
import { useUsers } from "../../context/Users"
import { Box, Button, Card, FormControl, FormHelperText, FormLabel, IconButton, Input, Typography } from "@mui/joy"
import { useEffect, useState } from "react"
import { Lock, Visibility, VisibilityOff } from "@mui/icons-material"
import { isValidEmail } from "../../utilities/defaults"

function ResetPassword() {
    const { email, token } = useParams()
    const { resetPassword, resetPasswordData } = useUsers()
    const [passwordVisibility, setPasswordVisibility] = useState(false)
    const [password, setPassword] = useState<{
        newPassword: string,
        newPasswordConfirm: string
    }>({
        newPassword: "",
        newPasswordConfirm: ""
    })
    const navigate = useNavigate()
    useEffect(() => {
        if (resetPasswordData?.isSuccess) {
            navigate("/auth/login")
        }
    }, [resetPasswordData])
    return (
        <form onSubmit={(e) => {
            e.preventDefault()
            resetPassword(email!, token!, password.newPassword)
        }}>
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
                    <Typography color="danger">{resetPasswordData?.isIncorrect && "This link has expired or you've entered wrong link"}</Typography>
                    <FormLabel sx={{ fontSize: "20px" }}>Reset Password</FormLabel>
                    <FormControl
                        required={true}
                        color={
                            password.newPassword.trim() && password.newPassword.length < 8
                                ? "warning"
                                : password.newPasswordConfirm !== password.newPassword &&
                                    password.newPasswordConfirm.trim().length >= 8 &&
                                    password.newPassword.trim().length >= 8
                                    ? "danger"
                                    : "neutral"
                        }
                    >
                        <FormLabel>Password</FormLabel>
                        <Input
                            name="password"
                            onChange={(e) => setPassword({ ...password, newPassword: e.target.value, })}
                            value={password.newPassword}
                            endDecorator={
                                <IconButton
                                    onClick={() => setPasswordVisibility(!passwordVisibility)}
                                >
                                    {passwordVisibility ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                            }
                            placeholder="New Password"
                            type={passwordVisibility ? "text" : "password"}
                            startDecorator={<Lock />}
                        />
                        <FormHelperText>
                            {!password?.newPassword.trim() ||
                                (password?.newPassword.length < 8 && "Password is too short")}
                            {password?.newPasswordConfirm.trim().length >= 8 &&
                                password?.newPasswordConfirm !== password?.newPassword &&
                                password?.newPassword.trim().length >= 8 &&
                                "Password does not match"}
                        </FormHelperText>
                    </FormControl>
                    <FormControl
                        required={true}
                        color={
                            password?.newPasswordConfirm.trim() && password?.newPasswordConfirm.length < 8
                                ? "warning"
                                : password?.newPasswordConfirm !== password?.newPassword &&
                                    password?.newPasswordConfirm.trim().length >= 8 &&
                                    password?.newPassword.trim().length >= 8
                                    ? "danger"
                                    : "neutral"
                        }
                    >
                        <FormLabel>Confirm Password</FormLabel>
                        <Input
                            name="cpassword"
                            onChange={(e) => setPassword({ ...password, newPasswordConfirm: e.target.value })}
                            value={password?.newPasswordConfirm}
                            endDecorator={
                                <IconButton
                                    onClick={() => setPasswordVisibility(!passwordVisibility)}
                                >
                                    {passwordVisibility ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                            }
                            placeholder="Confirm New Password"
                            type={passwordVisibility ? "text" : "password"}
                            startDecorator={<Lock />}
                        />
                        <FormHelperText>
                            {!password?.newPasswordConfirm.trim() ||
                                (password?.newPasswordConfirm.length < 8 && "Password is too short")}
                            {password?.newPasswordConfirm !== password?.newPassword &&
                                password?.newPasswordConfirm.trim().length >= 8 &&
                                password?.newPassword.trim().length >= 8 &&
                                "Password does not match"}
                        </FormHelperText>
                    </FormControl>
                    <Button
                        type="submit"
                        disabled={
                            !isValidEmail(email!) ||
                            resetPasswordData?.isLoading ||
                            password?.newPasswordConfirm.trim().length < 8 ||
                            password?.newPasswordConfirm !== password?.newPassword ||
                            password?.newPassword.trim().length < 8
                        }
                        sx={{
                            background: "rgb(255, 216, 77)",
                            color: "black",
                            ":hover": {
                                background: "rgb(255, 216, 77)",
                                opacity: 0.8,
                                transition: "all 0.2s ease-in-out",
                            },
                        }}
                    >
                        {resetPasswordData?.isLoading
                            ? "Loading..."
                            : "Submit"}
                    </Button>
                </Card>
            </Box>
        </form>
    )
}

export default ResetPassword