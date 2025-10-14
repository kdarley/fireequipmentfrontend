'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
// import postgres from 'postgres';
import {sqlData, sqlAuth} from './sql';
import { auth, signIn } from '@/auth';
import { AuthError } from 'next-auth';
import  bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

// const sql = postgres(process.env.POSTGRES_URL!, {
//   ssl: { rejectUnauthorized: false }  // safer for self-signed / private DB
// });

const FormSchema = z.object({
  id: z.string(),
  customerId: z.string({
    invalid_type_error: 'Please select a customer.',
  }),
  amount: z.coerce.number().gt(0, { message: 'Please enter an amount greater than $0.' }),
  status: z.enum(['pending', 'paid'], {
    invalid_type_error: 'Please select an invoice status.',
  }),
  date: z.string(),
});

export type State = {
  errors?: {
    customerId?: string[];
    amount?: string[];
    status?: string[];
  };
  message?: string | null;
};
 
const CreateInvoice = FormSchema.omit({ id: true, date: true });

export async function createInvoice(prevState: State, formData: FormData) {
  const validatedFields = CreateInvoice.safeParse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
    });

    if (!validatedFields.success) {
        // console.log(validatedFields);
        return {
          errors: validatedFields.error.flatten().fieldErrors,
          message: 'Missing Fields. Failed to Create Invoice.',
        };
    }

    const { customerId, amount, status } = validatedFields.data;
    const amountInCents = amount * 100;
    const date = new Date().toISOString().split('T')[0];

    try {  
        await sqlData`
            INSERT INTO invoices (customer_id, amount, status, date)
            VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
        `; 
    } catch (error) {
        console.error(error);
        return {
            message: 'Database Error: Failed to Create Invoice.',
        };
    }

    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');
}

const UpdateInvoice = FormSchema.omit({ id: true, date: true });

export async function updateInvoice(
  id: string,
  prevState: State,
  formData: FormData,
) {
  const validatedFields = UpdateInvoice.safeParse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });
 
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Update Invoice.',
    };
  }
 
  const { customerId, amount, status } = validatedFields.data;
  const amountInCents = amount * 100;
 
  try {
    await sqlData`
      UPDATE invoices
      SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
      WHERE id = ${id}
    `;
  } catch (error) {
    return { message: 'Database Error: Failed to Update Invoice.' };
  }
 
  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

export async function deleteInvoice(id: string) {
  // throw new Error('Failed to Delete Invoice');

  await sqlData`DELETE FROM invoices WHERE id = ${id}`;
  revalidatePath('/dashboard/invoices');
}

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    await signIn('credentials', formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials.';
        default:
          return 'Something went wrong.';
      }
    }
    throw error;
  }
}

export type UserState = {
  errors?: {
    first_name?: string[];
    last_name?: string[];
    email?: string[];
    password?: string[];
  };
  message?: string | null;
};

const UserFormSchema = z.object({
  id: z.string(),
  first_name: z.string().min(1, { message: 'First name is required.' }),
  last_name: z.string().min(1, { message: 'Last name is required.' }),
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters long.' }),
});

const CreateUser = UserFormSchema.omit({ id: true });

// export async function createUser(prevState: UserState, formData: FormData): Promise<UserState> {
//   const validatedFields = CreateUser.safeParse({
//     first_name: formData.get('first_name'),
//     last_name: formData.get('last_name'),
//     email: formData.get('email'),
//     password: formData.get('password'),
//   });

//   if (!validatedFields.success) {
//     return {
//       errors: validatedFields.error.flatten().fieldErrors,
//       message: 'Invalid input. Failed to create user.',
//     };
//   }

//   const { first_name, last_name, email, password } = validatedFields.data;

//   // console.log('CREATE USER FUNCTION HIT!');
//   // console.log('First Name:', first_name);
//   // console.log('Last Name:', last_name);
//   // console.log('Email:', email);
//   // console.log('Password:', password);

//   const existingUser = await sql`
//   SELECT * FROM users WHERE email = ${email}`;

//   if (existingUser.length > 0) {
//     return {
//       errors: { email: ['A user with that email already exists.'] },
//     };
//   }

//   try {
//     const hashedPassword = await bcrypt.hash(password, 10);

//     await sql`
//       INSERT INTO users (id, first_name, last_name, email, password)
//       VALUES (${uuidv4()}, ${first_name}, ${last_name}, ${email}, ${hashedPassword})
//     `;
//   } catch (error) {
//     return {
//       message: 'Database Error: Failed to Create User.',
//     };
//   }

//   try {
//     await signIn('credentials', {
//       redirect: false,
//       email,
//       password,
//     });
//   } catch (error) {
//     console.error('Auto-login failed:', error);
//     return {
//       message: 'User created, but failed to sign in.',
//     };
//   }

//   redirect('/dashboard');
// }

export async function createUser(prevState: UserState, formData: FormData): Promise<UserState> {
  const validatedFields = CreateUser.safeParse({
    first_name: formData.get('first_name'),
    last_name: formData.get('last_name'),
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Invalid input. Failed to create user.',
    };
  }

  const { first_name, last_name, email, password } = validatedFields.data;

  // Check if user exists
  let existingUser;
  try {
    existingUser = await sqlAuth`SELECT * FROM user_login WHERE email = ${email}`;
  } catch (err) {
    console.error('Error checking existing user:', err);
    return { message: 'Database Error: Failed to check existing user.' };
  }

  if (existingUser.length > 0) {
    return {
      errors: { email: ['A user with that email already exists.'] },
    };
  }

  // Insert new user
  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    await sqlAuth`
      INSERT INTO user_login (id, first_name, last_name, email, password)
      VALUES (${uuidv4()}, ${first_name}, ${last_name}, ${email}, ${hashedPassword})
    `;
  } catch (err) {
    console.error('Error inserting new user:', err);
    return { message: 'Database Error: Failed to create user.' };
  }

  // Auto-login
  try {
    await signIn('credentials', { redirect: false, email, password });
  } catch (err) {
    console.error('Auto-login failed:', err);
    return { message: 'User created, but failed to sign in.' };
  }

  redirect('/dashboard');
}