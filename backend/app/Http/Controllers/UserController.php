<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

/**
 * @OA\Tag(
 *     name="Usuarios",
 *     description="Operaciones para gestionar usuarios (solo administradores)"
 * )
 */
class UserController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/users",
     *     summary="Listar todos los usuarios",
     *     tags={"Usuarios"},
     *     security={{"sanctum":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Lista de usuarios",
     *         @OA\JsonContent(
     *             type="array",
     *             @OA\Items(
     *                 @OA\Property(property="id", type="integer"),
     *                 @OA\Property(property="name", type="string"),
     *                 @OA\Property(property="email", type="string"),
     *                 @OA\Property(property="user_type", type="string")
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=403,
     *         description="No autorizado"
     *     )
     * )
     */
   public function index()
{
    $users = User::with(['roles', 'conductor'])->get(); //se añade conductores
    return response()->json($users);
}

    /**
     * @OA\Post(
     *     path="/api/users",
     *     summary="Crear un nuevo usuario",
     *     tags={"Usuarios"},
     *     security={{"sanctum":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"name","email","password","user_type"},
     *             @OA\Property(property="name", type="string", example="Ana López"),
     *             @OA\Property(property="email", type="string", format="email", example="ana@example.com"),
     *             @OA\Property(property="password", type="string", format="password", example="password123"),
     *             @OA\Property(property="phone", type="string", example="123456789", nullable=true),
     *             @OA\Property(property="user_type", type="string", enum={"client","driver","admin"}, example="client"),
     *             @OA\Property(property="licencia", type="string", example="ABC12345", nullable=true)
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Usuario creado",
     *         @OA\JsonContent(
     *             @OA\Property(property="id", type="integer"),
     *             @OA\Property(property="name", type="string"),
     *             @OA\Property(property="email", type="string"),
     *             @OA\Property(property="user_type", type="string")
     *         )
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Datos inválidos"
     *     )
     * )
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'phone' => 'nullable|string|max:20',
            'user_type' => 'required|in:client,driver,admin',
            'licencia' => 'required_if:user_type,driver|string|unique:conductores,licencia', // Corregido
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'phone' => $request->phone,
            'user_type' => $request->user_type,
        ]);

        $user->assignRole($request->user_type);

        if ($request->user_type === 'driver') {
            $user->conductor()->create([
                'licencia' => $request->licencia,
                'estado_verificacion' => 'pendiente',
            ]);
        }

        return response()->json($user, 201);
    }

    /**
     * @OA\Get(
     *     path="/api/users/{id}",
     *     summary="Obtener un usuario específico",
     *     tags={"Usuarios"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Usuario encontrado",
     *         @OA\JsonContent(
     *             @OA\Property(property="id", type="integer"),
     *             @OA\Property(property="name", type="string"),
     *             @OA\Property(property="email", type="string"),
     *             @OA\Property(property="user_type", type="string")
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Usuario no encontrado"
     *     )
     * )
     */
    public function show($id)
    {
        $user = User::with('roles')->findOrFail($id);
        return response()->json($user);
    }

    /**
     * @OA\Put(
     *     path="/api/users/{id}",
     *     summary="Actualizar un usuario",
     *     tags={"Usuarios"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="name", type="string", example="Ana López"),
     *             @OA\Property(property="email", type="string", format="email", example="ana@example.com"),
     *             @OA\Property(property="phone", type="string", example="123456789", nullable=true),
     *             @OA\Property(property="user_type", type="string", enum={"client","driver","admin"}, example="client"),
     *             @OA\Property(property="licencia", type="string", example="ABC12345", nullable=true)
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Usuario actualizado",
     *         @OA\JsonContent(
     *             @OA\Property(property="id", type="integer"),
     *             @OA\Property(property="name", type="string"),
     *             @OA\Property(property="email", type="string"),
     *             @OA\Property(property="user_type", type="string")
     *         )
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Datos inválidos"
     *     )
     * )
     */
    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $id,
            'phone' => 'nullable|string|max:20',
            'user_type' => 'required|in:client,driver,admin',
            'licencia' => 'required_if:user_type,driver|string|unique:conductores,licencia,' . ($user->conductor ? $user->conductor->id : 0), // Corregido
        ]);

        $user->update([
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'user_type' => $request->user_type,
        ]);

        $user->syncRoles($request->user_type);

        if ($request->user_type === 'driver') {
            $user->conductor()->updateOrCreate(
                ['user_id' => $user->id],
                ['licencia' => $request->licencia, 'estado_verificacion' => 'pendiente']
            );
        } else {
            $user->conductor()->delete();
        }

        return response()->json($user);
    }

    /**
     * @OA\Delete(
     *     path="/api/users/{id}",
     *     summary="Eliminar un usuario",
     *     tags={"Usuarios"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=204,
     *         description="Usuario eliminado"
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Usuario no encontrado"
     *     )
     * )
     */
    public function destroy($id)
    {
        $user = User::findOrFail($id);
        $user->delete();
        return response()->json(null, 204);
    }
}