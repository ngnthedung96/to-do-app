"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import axios from "axios";

const SignupSchema = yup.object().shape({
  name: yup.string().required("Tên người dùngs không hợp lệ"),
  email: yup.string().required("Email không hợp lệ"),
  password: yup.string().required("Mật khẩu không hợp lệ"),
});

type FormData = {
  email: string;
  password: string;
  name: string;
};

export default function loginForm() {
  const [isLoadingRegister, setIsLoadingRegister] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(SignupSchema),
  });
  const router = useRouter();

  const onSubmit = async (data: FormData) => {
    if (isLoadingRegister) {
      return;
    }
    setIsLoadingRegister(true);

    const addUser = await addUserMethod(data.name, data.email, data.password);
    if (addUser?.status) {
      router.push("/login");
    } else {
      alert(addUser?.message);
    }
    setIsLoadingRegister(true);
  };
  // functions
  async function addUserMethod(name: string, email: string, password: string) {
    try {
      const newUser = {
        name,
        email,
        password,
      };
      const response = await axios.post(
        `${process.env.APP_URL}/api/auth/register`,
        newUser
      );
      if (!response.data) {
        alert("Có lỗi");
      }
      const { error, message }: { error: boolean; message: string } =
        response.data;
      if (!error) {
        return {
          status: true,
        };
      } else {
        return {
          status: false,
          message,
        };
      }
    } catch (err: any) {
      const errRes = err.response;
      if (errRes) {
        const errResData = errRes.data;
        if (errResData.message) {
          return {
            status: false,
            message: errResData.message,
          };
        } else {
          return {
            status: false,
            message: errResData,
          };
        }
      }
    }
  }

  return (
    <main className=" min-h-screen p-24">
      <div className="max-w-sm mx-auto p-6 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
        <form
          className={isLoadingRegister ? "opacity-20" : ""}
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="mb-5">
            <label
              htmlFor="name"
              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >
              Tên người dùng
            </label>
            <input
              type="text"
              id="name"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="Nhập tên"
              {...register("name")}
            />
            {errors.email && (
              <p className="text-red-500">{errors.email.message}</p>
            )}
          </div>
          <div className="mb-5">
            <label
              htmlFor="email"
              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="Nhập email"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-red-500">{errors.email.message}</p>
            )}
          </div>
          <div className="mb-5">
            <label
              htmlFor="password"
              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="Nhập mật khẩu"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-red-500">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          >
            Đăng ký
          </button>
          <span>
            <p className="mb-0 mt-2 pt-1 text-sm font-semibold">
              Already a member?
              <a
                href="/login"
                className="ms-2 text-red-500 transition duration-150 ease-in-out hover:text-danger-600 focus:text-danger-600 active:text-danger-700"
              >
                Login
              </a>
            </p>
          </span>
        </form>
        <div
          className={
            !isLoadingRegister
              ? "hidden"
              : "" + "absolute -translate-x-1/2  top-1/4 left-1/2"
          }
          role="status"
        >
          <svg
            aria-hidden="true"
            className="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
            viewBox="0 0 100 101"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
              fill="currentColor"
            />
            <path
              d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
              fill="currentFill"
            />
          </svg>
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    </main>
  );
}
