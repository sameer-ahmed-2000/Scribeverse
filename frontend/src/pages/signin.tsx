import { InputBox } from '../components/InputBox';
import { PasswordBox } from '../components/PasswordBox';
import { useSignin } from '../hooks/useSignin';
import { DialogueBox } from '../components/Dialogue';
import { Link } from 'react-router-dom';
import { FunctionButton } from '../components/Button';

export default function Signin() {
    const {
        setEmail,
        setPassword,
        loading,
        error,
        handleSignin
    } = useSignin();

    return (
        <div className="grid grid-cols-2 h-screen">
            <div className="flex flex-col justify-center items-center col-span-1">
                <div className="rounded-lg w-80 text-center p-2 h-max px-4">
                    <div className="text-3xl font-extrabold">Sign in</div>
                    <div className="pt-2">
                        <InputBox placeholder="sameer@gmail.com" onChange={(e) => setEmail(e.target.value)} />
                        <PasswordBox placeholder="123456" onChange={(e) => setPassword(e.target.value)} />
                        <FunctionButton
                            onClick={handleSignin}
                            label={loading ? "Signing in..." : "Sign in"}
                            disabled={loading}
                        />
                        {error && <div className="text-red-500 mt-2">{error}</div>}
                        <div className="py-2 text-sm flex justify-center">
                            <div>{"Don't have an account"}</div>
                            <Link className="pointer underline pl-1 cursor-pointer" to={"/signup"}>
                                {"Sign up"}
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
