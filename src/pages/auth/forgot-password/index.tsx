import ForgotPasswordEmail from './ForgotPassword'
import EmailSent from './EmailSent'

function ForgotPassword() {
    const type = sessionStorage.getItem("forgot-password")
    return !type ? (
        <ForgotPasswordEmail />
    ) : <EmailSent />
}

export default ForgotPassword