import 'reflect-metadata';
import * as dotenv from 'dotenv';
dotenv.config(); 
import { DataSource } from 'typeorm';
import { User } from '../entities/User';
import { Product } from '../entities/Product';
import { SalesOrder } from '../entities/SalesOrder';
import { SalesOrderItem } from '../entities/SalesOrderItem';
// import other entities here...

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: true, // change to false in production
  logging: false,
  entities: [User, Product, SalesOrder, SalesOrderItem], // add other entities here
  migrations: ['src/migrations/*.ts'],
  subscribers: [],
});
