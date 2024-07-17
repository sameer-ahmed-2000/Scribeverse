import { InputBox } from '../components/InputBox';
import { PasswordBox } from '../components/PasswordBox';
import { DialogueBox } from '../components/Dialogue';
import { Link } from 'react-router-dom';
import { FunctionButton } from '../components/Button';
import { useSignup } from '../hooks/useSignup';

export default function Signup() {
    const {
        setName,
        setEmail,
        setPassword,
        loading,
        error,
        handleSignup
    } = useSignup();

    return (
        <div className="grid grid-cols-2 h-screen">
            <div className="flex flex-col justify-center items-center col-span-1">
                <div className="rounded-lg w-80 text-center p-2 h-max px-4">
                    <div className="text-3xl font-extrabold">Create an Account</div>
                    <div className="pt-2">
                        <InputBox placeholder="Sameer" onChange={(e) => setName(e.target.value)} />
                        <InputBox placeholder="sameer@gmail.com" onChange={(e) => setEmail(e.target.value)} />
                        <PasswordBox placeholder="123456" onChange={(e) => setPassword(e.target.value)} />
                        <FunctionButton
                            onClick={handleSignup}
                            label={loading ? "Signing up..." : "Sign up"}
                            disabled={loading}
                        />
                        {error && <div className="text-red-500 mt-2">{error}</div>}
                        <div className="py-2 text-sm flex justify-center">
                            <div>{"Already have an account"}</div>
                            <Link className="pointer underline pl-1 cursor-pointer" to={"/signin"}>
                                {"Sign in"}
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
            <div className="col-span-1 flex justify-center items-center">
                <DialogueBox />
            </div>
        </div>
    );
}
