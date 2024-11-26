'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
// import { useRouter } from 'next/router'
// import Header from '../components/header'
// import { useNavigate } from 'react-router-dom';
import { z } from 'zod'
import { toast } from 'react-toastify';
import { ThreeDot } from 'react-loading-indicators';
import { API_URL } from '../global';

export default function LoginForm() {

  const [isLoading, setIsLoading] = useState<boolean>(false)
  // const [error, setError] = useState<string | null>(null)

  const [username, setUserName] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  // const [error, setError] = useState<string>('');
  // const navigate = useNavigate();
  const router = useRouter()

  const LoginFormSchema = z.object({
    username: z.string().email({ message: 'Please enter a valid email.' }).trim(),
    password: z
      .string()
    // .min(8, { message: 'Be at least 8 characters long' })
    // .regex(/[a-zA-Z]/, { message: 'Contain at least one letter.' })
    // .regex(/[0-9]/, { message: 'Contain at least one number.' })
    // .regex(/[^a-zA-Z0-9]/, {
    // message: 'Contain at least one special character.',
    // })
    // .trim(),
  })


  //   var [state, setAction] = useFormState(logindata, undefined)
  //   const { pending } = useFormStatus()
  //   const router = useRouter()

  function handleUsernameChange(e: React.ChangeEvent<HTMLInputElement>) {
    setUserName(e.target.value.toString());
  };

  function handlePasswordChange(e: React.ChangeEvent<HTMLInputElement>) {
    setPassword(e.target.value.toString());
  };

  function goBack() {
    router.push("/")
  };

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {

    event.preventDefault();

    const formData = new FormData(event.currentTarget)

    const validatedFields = LoginFormSchema.safeParse({
      username: formData.get('username'),
      password: formData.get('password'),
    })

    console.log(validatedFields)
    console.log("username", username)
    console.log("password", password)

    // if (username === '' || password === '') {
    //   setError('Email and password are required');
    //   return;
    // }

    if (!validatedFields.success) {
      if(validatedFields.error && validatedFields.error.errors && validatedFields.error.errors[0]) {
        toast.error(validatedFields.error.errors[0].message);
      } else {
        toast.error("Invalid data entered")
      }
      return;
    }

    console.log("valid data")
    setIsLoading(true)

    try {
      var body = {
        email: username.toLowerCase(),
        password: password
      }
      // const formData = new FormData(event.currentTarget)
      const response = await fetch(API_URL + '/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', // Specify the content type as JSON
        },
        body: JSON.stringify(body),
      })

      var data
      data = await response.json()
      console.log(data)

      if (!response.ok) {
        toast.error(data.error)
        return
        // throw new Error('Failed to submit the data. Please try again.')
      }

      // Handle response if necessary

      localStorage.setItem('user', JSON.stringify(data.user));
      toast.info("Logged in successfully!")
      router.push('/welcome', data.user);
      // ...
    } catch (error: any) {
      // Capture the error message to display to the user
      // setError(error.message)
      console.error(error)
      toast.error('Failed to submit the data. Please try again!')
    } finally {
      setIsLoading(false)
    }

  };


  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      {/* // <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen pb-20 font-[family-name:var(--font-geist-sans)]"> */}
      {/* <Header/> */}

  {isLoading && (
    <div className='loading-div'>
      <ThreeDot variant="bounce" color="#226699" size="small" text="" textColor="" />
    </div>
  )}

      <main className="flex flex-col row-start-2 items-center sm:items-start">

    <h1 className="text-2xl font-bold text-center">Welcome Back!</h1>
    <p className="text-sm text-center text-gray-600 mb-2">
      Please enter your credentials to log in to your account.
    </p>

        <form onSubmit={handleSubmit}>
          <div>
            {/* <label htmlFor="name">Name</label> */}
            {/* <input id="name" name="name" placeholder="Name" /> */}
            <input value={username} onChange={handleUsernameChange} id="username" name="username" placeholder="Email" type="text" className="m-3 ml-0 rounded-xl bg-foreground text-background gap-2 h-10 sm:h-12 px-4 sm:px-5  sm:min-w-96" />
          </div>


          <div>
            <input value={password} onChange={handlePasswordChange} id="password" name="password" placeholder="Password" type="password" className="m-3 ml-0 rounded-xl bg-foreground text-background gap-2 h-10 sm:h-12 px-4 sm:px-5 sm:min-w-96" />
          </div>

          <div className="m-3 flex gap-4 items-center flex-row float-right">
            <button
              onClick={goBack}
              type="button"
              className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:min-w-44"
            >
              Back
            </button>
            <button
              className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5  sm:min-w-44"
              type='submit'
            >
              Login
            </button>
          </div>

        </form>
      </main>
    </div>
  )
}