import Joi from 'joi'

export const loginSchema = Joi.object({
  email: Joi.string().email({ tlds: false }).required().messages({
    'string.email': 'Invalid email address',
    'any.required': 'Email is required',
  }),
  password: Joi.string().min(1).required().messages({
    'any.required': 'Password is required',
  }),
})

export const registerSchema = Joi.object({
  name: Joi.string().min(2).required().messages({
    'string.min': 'Name must be at least 2 characters',
    'any.required': 'Name is required',
  }),
  email: Joi.string().email({ tlds: false }).required().messages({
    'string.email': 'Invalid email address',
    'any.required': 'Email is required',
  }),
  password: Joi.string().min(8).required().messages({
    'string.min': 'Password must be at least 8 characters',
    'any.required': 'Password is required',
  }),
  workspaceName: Joi.string().min(2).required().messages({
    'string.min': 'Workspace name must be at least 2 characters',
    'any.required': 'Workspace name is required',
  }),
})

export const verifyOtpSchema = Joi.object({
  otp: Joi.string().length(6).required().messages({
    'string.length': 'OTP must be exactly 6 digits',
    'any.required': 'OTP is required',
  }),
})

export const changePasswordSchema = Joi.object({
  newPassword: Joi.string().min(8).required().messages({
    'string.min': 'Password must be at least 8 characters',
    'any.required': 'New password is required',
  }),
})

export const inviteMemberSchema = Joi.object({
  name: Joi.string().min(2).required().messages({
    'string.min': 'Name must be at least 2 characters',
    'any.required': 'Name is required',
  }),
  email: Joi.string().email({ tlds: false }).required().messages({
    'string.email': 'Invalid email address',
    'any.required': 'Email is required',
  }),
  role: Joi.string().required().messages({
    'any.required': 'Role is required',
  }),
})

export type LoginFormData = { email: string; password: string }
export type RegisterFormData = { name: string; email: string; password: string; workspaceName: string }
export type VerifyOtpFormData = { otp: string }
export type ChangePasswordFormData = { newPassword: string }
export type InviteMemberFormData = { name: string; email: string; role: string }
