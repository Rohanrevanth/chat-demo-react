'use client'
 
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { z } from 'zod'
import { toast } from 'react-toastify';
import { ThreeDot } from 'react-loading-indicators';
import { API_URL } from '../global';

export default function SignupForm() {

    const [isLoading, setIsLoading] = useState<boolean>(false)
    // const [error, setError] = useState<string | null>(null)

    const [user, setUser] = useState<string>('');
    const [username, setUserName] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [confirmpassword, setConfirmpassword] = useState<string>('');
    // const [error, setError] = useState<string>('');
    // const navigate = useNavigate();
    const router = useRouter()

    const SignupFormSchema = z.object({
    user: z.string()
        .min(1, { message: 'Name cannot be empty.' })
        .trim(),
    username: z.string()
        .email({ message: 'Please enter a valid email.' })
        .min(1, { message: 'Email is required.' })
        .trim(),
    password: z.string()
        // .min(8, { message: 'Be at least 8 characters long' })
        // .regex(/[a-zA-Z]/, { message: 'Contain at least one letter.' })
        // .regex(/[0-9]/, { message: 'Contain at least one number.' })
        // .regex(/[^a-zA-Z0-9]/, {
        //   message: 'Contain at least one special character.',
        // })
        .trim(),
    confirmpassword: z.string()
        // .min(8, { message: 'Be at least 8 characters long' })
        // .regex(/[a-zA-Z]/, { message: 'Contain at least one letter.' })
        // .regex(/[0-9]/, { message: 'Contain at least one number.' })
        // .regex(/[^a-zA-Z0-9]/,{
        //   message: 'Contain at least one special character.',
        // })
        .trim(),
    })


//   var [state, setAction] = useFormState(logindata, undefined)
//   const { pending } = useFormStatus()
//   const router = useRouter()
  
  function handleUserChange (e: React.ChangeEvent<HTMLInputElement>) {
    setUser(e.target.value.toString());
  };

  function handleUsernameChange (e: React.ChangeEvent<HTMLInputElement>) {
    setUserName(e.target.value.toString());
  };

  function handlePasswordChange (e: React.ChangeEvent<HTMLInputElement>) {
    setPassword(e.target.value.toString());
  };

  function handleConfirmpasswordChange (e: React.ChangeEvent<HTMLInputElement>) {
    setConfirmpassword(e.target.value.toString());
  };

  function goBack () {
    router.push("/")
  };

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    // setError(null) // Clear previous errors when a new request starts

    const formData = new FormData(event.currentTarget)

    const validatedFields = SignupFormSchema.safeParse({
      user: formData.get('user'),
      username: formData.get('username'),
      password: formData.get('password'),
      confirmpassword: formData.get('confirmpassword'),
    })

    console.log(validatedFields)
    console.log("user", user)
    console.log("username", username)
    console.log("password", password)
    console.log("confirmpassword", confirmpassword)

    if (password != confirmpassword ) {
      console.log("Passwords do not match")
      toast.error('Passwords do not match');
      return;
    }

    if (!validatedFields.success) {
      console.log(validatedFields.error.errors[0].message)
        if(validatedFields.error && validatedFields.error.errors && validatedFields.error.errors[0]) {
          toast.error(validatedFields.error.errors[0].message);
        } else {
          toast.error("Invalid data entered")
        }
        console.log("Invalid data entered")
        return;
    }

    setIsLoading(true)

    try {
      var body = {
        username : user,
        email : username.toLowerCase(),
        password : password
      }
      // const formData = new FormData(event.currentTarget)
      const response = await fetch(API_URL + '/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', // Specify the content type as JSON
        },
        body: JSON.stringify(body),
      })
 
      if (!response.ok) {
        toast.error('Failed to submit the data. Please try again.')
        throw new Error('Failed to submit the data. Please try again.')
        return
      }
 
      // Handle response if necessary
      const data = await response.json()
      console.log(data)
      toast.info('Registerd successfully!');
      router.push("/")

      // ...
    } catch (error : any) {
      // Capture the error message to display to the user
      toast.error('Failed to submit the data. Please try again.')
      // setError(error.message)
      console.error(error)
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


    <h1 className="text-2xl font-bold text-center">Create Your Account</h1>
    <p className="text-sm text-center text-gray-600 mb-2">
      Please fill in the details below to register for a new account.
    </p>

    <form onSubmit={handleSubmit}>
      <div>
        {/* <label htmlFor="name">Name</label> */}
        {/* <input id="name" name="name" placeholder="Name" /> */}
        <input value={user} onChange={handleUserChange} id="user" name="user" placeholder="Name" type="text" className="m-3 ml-0 rounded-xl bg-foreground text-background gap-2 h-10 sm:h-12 px-4 sm:px-5  sm:min-w-96" />
      </div>


      <div>
        {/* <label htmlFor="name">Name</label> */}
        {/* <input id="name" name="name" placeholder="Name" /> */}
        <input value={username} onChange={handleUsernameChange} id="username" name="username" placeholder="Email" type="text" className="m-3 ml-0 rounded-xl bg-foreground text-background gap-2 h-10 sm:h-12 px-4 sm:px-5  sm:min-w-96" />
      </div>


      <div>
        {/* <label htmlFor="password">Password</label>
        <input id="password" name="password" type="password" /> */}
        <input value={password} onChange={handlePasswordChange} id="password" name="password" placeholder="Password" type="password" className="m-3 ml-0 rounded-xl bg-foreground text-background gap-2 h-10 sm:h-12 px-4 sm:px-5 sm:min-w-96" />
      </div>


      <div>
        {/* <label htmlFor="password">Password</label>
        <input id="password" name="password" type="password" /> */}
        <input value={confirmpassword} onChange={handleConfirmpasswordChange} id="confirmpassword" name="confirmpassword" placeholder="Confirm password" type="password" className="m-3 ml-0 rounded-xl bg-foreground text-background gap-2 h-10 sm:h-12 px-4 sm:px-5 sm:min-w-96" />
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
            Register
          </button>
        </div>



    </form>


      {/* <div className='mt-6 float-right m-2'>
      {error? <p>Invalid creds...</p> : <p>...</p>}
      {state?.errors?.username ? <p>{state.errors.username}</p> : <p></p>}
      {state?.errors?.password ? (
        <div>
          <p>Password must:</p>
          <ul>
            {state.errors.password.map((error : any) => (
              <li key={error}>- {error}</li>
            ))}
          </ul>
        </div>
      ) : <div></div>}
      </div> */}




      </main>
    </div>
  )
}