import { Request, Response, Router } from "express";
import AuthService from "./auth.service";
import { RegisterUser } from "./dtos/aut.dto";
import { LoginUser } from "./dtos/aut.dto";
import Route from "../../middleware/RouteDecorator";


class AuthController {
  private authService: AuthService;
  constructor() {
    this.authService = new AuthService();
  }

  @Route()
  async loginUser(req: Request, res: Response) {
    const { email, password }: LoginUser = req.body;
    const {password: _ , ...userInDb } = await this.authService.loginUser({ email, password });
    const token = this.authService.generateToken({
      email: userInDb.email,
      id: userInDb.id,
      role: userInDb.role,
    });
    return { user: userInDb, token };
  }

  @Route()
  async registerUser(req: Request, res: Response){
    const {
      first_name,
      last_name,
      add_data,
      password,
      email,
      role,
    }: RegisterUser = req.body;
    const newUser = await this.authService.registerUser({
      first_name,
      last_name,
      add_data,
      password,
      email,
      role,
    });
    const token = this.authService.generateToken({
      email: newUser.email,
      id: newUser.id,
      role: newUser?.role,
    });
    newUser.password = null;
    return { user: newUser, token };
  };
}
export default new AuthController();
