const request = require('supertest');

const app = require('../src/index');

describe('GET /api/', () => {
    it('expect array lessons (with filters#1)', async () => {
        const res = await request(app)
            .get('/api/')
            .query('date=2019-06-17')
            .query('status=0')
            .query('teacherIds=1')
            .query('studentsCount=3')
            .query('page=1')
            .query('lessonsPerPage=5');

        expect(res.body).toEqual(expect.arrayContaining([
            expect.objectContaining({
                id: expect.any(Number),
                date: expect.any(String),
                title: expect.any(String),
                status: expect.any(Number),
                visitCount: expect.any(Number),
                students: expect.arrayContaining([
                    expect.objectContaining({
                        id: expect.any(Number),
                        name: expect.any(String),
                        visit: expect.any(Boolean),
                    }),
                ]),
                teachers: expect.arrayContaining([
                    expect.objectContaining({
                        id: expect.any(Number),
                        name: expect.any(String),
                    }),
                ]),
            }),
        ]));
    });

    it('expect array lessons (with filters#2)', async () => {
        const res = await request(app)
            .get('/api/')
            .query('date=2019-06-01,2019-12-12')
            .query('status=0')
            .query('teacherIds=1,2,3,4')
            .query('studentsCount=1,4')
            .query('page=2')
            .query('lessonsPerPage=2');

        expect(res.body).toEqual(expect.arrayContaining([
            expect.objectContaining({
                id: expect.any(Number),
                date: expect.any(String),
                title: expect.any(String),
                status: expect.any(Number),
                visitCount: expect.any(Number),
                students: expect.arrayContaining([
                    expect.objectContaining({
                        id: expect.any(Number),
                        name: expect.any(String),
                        visit: expect.any(Boolean),
                    }),
                ]),
                teachers: expect.arrayContaining([
                    expect.objectContaining({
                        id: expect.any(Number),
                        name: expect.any(String),
                    }),
                ]),
            }),
        ]));
    });

    it('expect array lessons (without filters)', async () => {
        const res = await request(app).get('/api/');
        expect(res.body).toEqual(expect.arrayContaining([
            expect.objectContaining({
                id: expect.any(Number),
                date: expect.any(String),
                title: expect.any(String),
                status: expect.any(Number),
                visitCount: expect.any(Number),
                students: expect.arrayContaining([
                    expect.objectContaining({
                        id: expect.any(Number),
                        name: expect.any(String),
                        visit: expect.any(Boolean),
                    }),
                ]),
                teachers: expect.arrayContaining([
                    expect.objectContaining({
                        id: expect.any(Number),
                        name: expect.any(String),
                    }),
                ]),
            }),
        ]));
    });

    it('expect status 400 (with incorrect filters)', async () => {
        const res = await request(app)
            .get('/api/')
            .query('date=error')
            .query('status=error')
            .query('teacherIds=error')
            .query('studentsCount=error')
            .query('page=error')
            .query('lessonsPerPage=error');
        expect(res.status).toEqual(400);
    });
});
