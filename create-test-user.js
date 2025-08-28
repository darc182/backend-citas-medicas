require('dotenv').config();
const { supabase } = require('./config/supabase');

async function createTestUser() {
  try {
    console.log('Creando usuario de prueba confirmado...');
    
    // Primero, intentar crear el usuario con admin
    const { data: adminData, error: adminError } = await supabase.auth.admin.createUser({
      email: 'admin@hospital.com',
      password: '123456789',
      email_confirm: true, // Confirmar automáticamente
      user_metadata: {
        nombre: 'Administrador',
        apellido: 'Hospital',
        rol: 'admin'
      }
    });

    if (adminError) {
      console.error('Error creando usuario con admin API:', adminError.message);
      console.log('Intentando crear usuario normal...');
      
      // Fallback: crear usuario normal
      const { data, error } = await supabase.auth.signUp({
        email: 'admin@hospital.com',
        password: '123456789',
        options: {
          data: {
            nombre: 'Administrador',
            apellido: 'Hospital',
            rol: 'admin'
          }
        }
      });

      if (error) {
        console.error('Error creando usuario:', error.message);
        return;
      }

      console.log('✅ Usuario creado (requiere confirmación de email):');
    } else {
      console.log('✅ Usuario creado y confirmado automáticamente:');
    }

    console.log('📧 Email: admin@hospital.com');
    console.log('🔐 Password: 123456789');
    console.log('👤 Nombre: Administrador Hospital');
    console.log('🏥 Rol: admin');
    console.log('\n🎯 Puedes usar estas credenciales para hacer login.');
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

createTestUser();
