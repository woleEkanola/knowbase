import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const { email, password, name, workspaceName } = await req.json();

    if (!email || !password || !workspaceName) {
      return NextResponse.json(
        { error: "Email, password, and workspace name are required." },
        { status: 400 }
      );
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from("User")
      .select("id")
      .eq("email", email)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { error: "A user with this email already exists." },
        { status: 409 }
      );
    }

    // Create workspace first
    const { data: workspace, error: workspaceError } = await supabase
      .from("Workspace")
      .insert({ name: workspaceName })
      .select()
      .single();

    if (workspaceError || !workspace) {
      console.error("Workspace creation error:", workspaceError);
      return NextResponse.json(
        { error: "Failed to create workspace." },
        { status: 500 }
      );
    }

    // Hash password and create user
    const hashedPassword = await bcrypt.hash(password, 12);

    const { data: user, error: userError } = await supabase
      .from("User")
      .insert({
        email,
        hashedPassword,
        name: name || null,
        workspaceId: workspace.id,
      })
      .select()
      .single();

    if (userError || !user) {
      console.error("User creation error:", userError);
      // Rollback: delete the workspace we just created
      await supabase.from("Workspace").delete().eq("id", workspace.id);
      return NextResponse.json(
        { error: "Failed to create user." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        workspaceId: user.workspaceId,
        workspaceName: workspace.name,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Something went wrong during registration." },
      { status: 500 }
    );
  }
}
