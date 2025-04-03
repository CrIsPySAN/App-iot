// src/controllers/auth.controller.js
const { supabase } = require("../services/supabase.service")

// Registrar un nuevo usuario
async function registerUser(req, res) {
  try {
    const { email, password } = req.body

    const { user, session, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      return res.status(400).json({ error: error.message })
    }

    return res.status(201).json({ user, session })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: "Error interno del servidor" })
  }
}

// Iniciar sesión
async function loginUser(req, res) {
  try {
    const { email, password } = req.body

    // Se utiliza signInWithPassword en lugar de signIn
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return res.status(400).json({ error: error.message })
    }

    // Asumiendo que data contiene { user, session }
    const { user, session } = data

    // Se formatea la respuesta para incluir session y user con los campos deseados
    const response = {
      session: {
        access_token: session.access_token,
        refresh_token: session.refresh_token,
        expires_in: session.expires_in,
        token_type: "bearer",
      },
      user: {
        id: user.id,
        email: user.email,
        created_at: user.created_at,
        // Puedes agregar más campos si los necesitas
      },
    }

    return res.status(200).json(response)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: "Error interno del servidor" })
  }
}

// Recuperar contraseña
async function recoverPassword(req, res) {
  try {
    const { email } = req.body

    // Se utiliza el nuevo método resetPasswordForEmail directamente desde supabase.auth
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "http://localhost:3000/reset-password",
    })

    if (error) {
      return res.status(400).json({ error: error.message })
    }

    return res.status(200).json({ message: "Se ha enviado un correo para recuperar la contraseña" })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: "Error interno del servidor" })
  }
}

// Restablecer contraseña
async function resetPassword(req, res) {
  try {
    const { password, token } = req.body

    // Si se proporciona un token personalizado, podemos implementar nuestra propia lógica
    if (token) {
      // Aquí puedes implementar tu propia lógica para validar el token y actualizar la contraseña
      // Por ejemplo, verificar el token en tu base de datos y actualizar la contraseña del usuario

      // Por ahora, simplemente devolvemos un éxito simulado
      return res.status(200).json({ message: "Contraseña actualizada correctamente" })
    } else {
      // Si no hay token personalizado, asumimos que la sesión ya está establecida por Supabase
      const { error } = await supabase.auth.updateUser({ password })

      if (error) {
        return res.status(400).json({ error: error.message })
      }

      return res.status(200).json({ message: "Contraseña actualizada correctamente" })
    }
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: "Error interno del servidor" })
  }
}

// Cerrar sesión
async function logoutUser(req, res) {
  try {
    // Intentamos cerrar sesión mediante Supabase
    const { error } = await supabase.auth.signOut()
    if (error) {
      return res.status(400).json({ error: error.message })
    }
    return res.status(200).json({ message: "Sesión cerrada exitosamente" })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: "Error interno del servidor" })
  }
}

module.exports = {
  registerUser,
  loginUser,
  recoverPassword,
  resetPassword,
  logoutUser,
}

