const fs = require("fs")
const data = require("../../data.json")
const {age} = require("../utils")

exports.post = (req,res)=> {
    const keys = Object.keys(req.body)
    
    for(key of keys) {
        if( req.body[key] == "") {
           return res.send('Preencha todos os campos')
            }
        }

        let {avatar_url, birth, services, name,gender} = req.body

        birth = Date.parse(birth)
        const created_at = Date.now()
        const id = Number(data.instructors.length + 1)


        data.instructors.push({
            id,
            name,
            avatar_url,
            birth,
            gender,
            created_at,
            services,
        })

        fs.writeFile("data.json", JSON.stringify(data,null,2), (err) =>  {
            if (err) return res.send('Write File Error')

            return res.redirect('/instructors')
        })

}

exports.create = (req, res) =>{
    return res.render('instructors/create')
} 

exports.show = (req, res) => {
    const { id} = req.params

    const foundInstructor = data.instructors.find((instructor) => {
        return instructor.id == id
    })

    if (!foundInstructor) return res.send("Instructor not found") 


    const instructor = {
        ...foundInstructor,
        age: age(foundInstructor.birth),
        services: foundInstructor.services.split(","),
        created_at: new Intl.DateTimeFormat("pt-BR").format(foundInstructor.created_at),
    }

    return res.render('instructors/show', {instructor})
}

exports.edit = (req, res) => {
    return res.render("instructors/edit")
}