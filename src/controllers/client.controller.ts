import httpStatus from 'http-status';
import catchAsync from '../utils/catchAsync';
import { clientService } from '../services';
import pick from '../utils/pick';
import ApiError from '../utils/ApiError';
import { Request, Response } from 'express';

export const createClient = catchAsync(
    async (req: Request, res: Response) => {
        const client = await clientService.createClient(req.body);
        res.status(httpStatus.CREATED).send({ client });
    }
);

export const getClients = catchAsync(
    async (req: Request, res: Response) => {
        const filter = pick(req.query, [
            'name',
            'email',
            'user',
        ]);
        const options = pick(req.query, [
            'sortBy',
            'limit',
            'page',
        ]);
        const result = await clientService.queryClients(
            filter,
            options
        );
        res.send(result);
    }
);

export const getClientById = catchAsync(
    async (req: Request, res: Response) => {
        const { clientId } = req.params;
        const client = await clientService.getClientById(
            clientId
        );
        res.send({ client });
    }
);

export const updateClient = catchAsync(
    async (req: Request, res: Response) => {
        const { clientId } = req.params;
        const client = await clientService.updateClient(
            clientId,
            req.body
        );
        res.send({ client });
    }
);

export const deleteClient = catchAsync(
    async (req: Request, res: Response) => {
        const { clientId } = req.params;
        await clientService.deleteClient(clientId);
        res.status(httpStatus.OK).send();
    }
);
