const {date, age} = require("../lib/utils")
const db = require('../config/db')
const { query } = require("../config/db")

module.exports  = {
    all(callback) {
        db.query(`
        SELECT instructors.*, count(members) AS total_students
        FROM instructors
        LEFT JOIN members ON (instructors.id = members.instructor_id)
        GROUP BY instructors.id
        ORDER BY name ASC `, (err, results) =>{
            if(err) throw `DataBase Error ${err}`

            callback(results.rows)
        })

        
        
    },
    create(data, callback){
        const query = `INSERT INTO instructors(
            name,
            avatar_url,
            gender,
            services,
            birth,
            created_at
        ) VALUES ($1,$2,$3,$4,$5,$6)
        RETURNING id
        `
         
        const values = [
         data.name,
         data.avatar_url,
         data.gender,
         data.services,
         date(data.birth).iso,
         date(Date.now()).iso
        ]

        db.query(query, values, (err,results)=> {
            if(err)  throw `Database Erro ${err}`

            callback(results.rows[0])
        })

        
    },
    find(id, callback){
        db.query(
            `SELECT * FROM instructors 
            WHERE id = $1`, 
            [id], (err, results)=>{
                if(err) return res.send('!Database Error')

                callback(results.rows[0])
        })
    },
    findBy(filter, callback){
        db.query(`
        SELECT instructors.*, count(members) AS total_students
        FROM instructors
        LEFT JOIN members ON (instructors.id = members.instructor_id)
        WHERE instructors.name ILIKE '%${filter}%'
        OR instructors.services ILIKE '%${filter}%'
        GROUP BY instructors.id
        ORDER BY name ASC `, (err, results) =>{
            if(err) throw `DataBase Error ${err}`

            callback(results.rows)
        })

    },
    update(data, callback) {
        const query = `
            UPDATE instructors SET
            name=($1),
            avatar_url=($2),
            birth=($3),
            gender=($4),
            services=($5)
            WHERE  id = $6
        `

        const values = [
            data.name,
            data.avatar_url,
            date(data.birth).iso,
            data.gender,
            data.services,
            data.id
        ]

        db.query(query, values, (err, results) =>{
            if(err) throw `DataBase Error ${err}`

            callback()
        })
    },
    delete(id,callback) {
        db.query(`DELETE FROM instructors WHERE id = $1`, [id],
            (err, results) => {
                if(err) throw `DataBase Error! ${err}`

                return callback()
            })
    },
    paginate(params) {
        const {filter, limit, offset, callback} = params

        let query = "",
            filterQuery = "",
            totalQuery = `(SELECT count(*) FROM instructors)AS total`

        

        if(filter) {


          filterQuery = `
          WHERE instructors.name ILIKE '%${filter}%'
          OR instructors.services ILIKE '%${filter}%'
          `

          totalQuery = `(
            SELECT count(*) FROM instructors
            ${filterQuery}
          ) as total`
        }

         query = `
            SELECT instructors.*,${totalQuery} , count(members) AS total_students
            FROM instructors
            LEFT JOIN members ON (instructors.id = members.instructor_id)
            ${filterQuery}
            GROUP BY instructors.id
            LIMIT $1
            OFFSET $2
             `
        db.query(query, [limit, offset], (err, results) => {
          if(err) throw `Database Error!${err}` 

          callback(results.rows)
        })
        
    }
}