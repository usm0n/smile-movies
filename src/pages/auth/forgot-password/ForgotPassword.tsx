import { Mail } from "@mui/icons-material"
import { Box, Button, Card, FormControl, FormHelperText, FormLabel, Input } from "@mui/joy"
import { isValidEmail, reload } from "../../../utilities/defaults"
import { useEffect, useState } from "react"
import { useUsers } from "../../../context/Users"

function ForgotPasswordEmail() {
    const [userEmail, setUserEmail] = useState<string | null>(null)
    const { forgotPassword, forgotPasswordData } = useUsers()

    useEffect(() => {
        if (forgotPasswordData?.data) {
            sessionStorage.setItem("forgot-password", `${userEmail}`)
            reload()
        }
    }, [forgotPasswordData])
    return (
        <form onSubmit={(e) => {
            e.preventDefault()
            forgotPassword(userEmail!)
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
                    <FormLabel sx={{ fontSize: "20px" }}>Forgot Password</FormLabel>
                    <Box gap={1} display={"flex"} flexDirection={"column"}>
                        <FormControl color={forgotPasswordData?.isIncorrect ? "danger" : "neutral"}>
                            <FormLabel>Email</FormLabel>
                            <Input
                                disabled={forgotPasswordData?.isLoading}
                                name="email"
                                placeholder="Your email"
                                value={userEmail!}
                                onChange={(e) => setUserEmail(e.target.value.toLocaleLowerCase())}
                                startDecorator={<Mail />}
                            />
                            <FormHelperText>
                                {forgotPasswordData?.isIncorrect && "Invalid email address"}
                            </FormHelperText>
                        </FormControl>
                    </Box>
                    <Button
                        type="submit"
                        disabled={
                            !isValidEmail(userEmail!) ||
                            !userEmail?.trim() ||
                            forgotPasswordData?.isLoading
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
                        {forgotPasswordData?.isLoading
                            ? "Loading..."
                            : "Submit"}
                    </Button>
                </Card>
            </Box>
        </form>
    )
}

export default ForgotPasswordEmail